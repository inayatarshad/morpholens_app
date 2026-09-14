#!/usr/bin/env python3
"""
MorphoLens neural inflection baselines (PyTorch, CPU).

Trains two character-level encoder-decoder models on exactly the train pools and test
sets used by the rule-based systems. Those are written by

    node scripts/run-experiment.mjs unimorph-data --splits-only

Both models share one architecture: a BiLSTM encoder over [tag tokens + lemma characters],
an LSTM decoder with attention, and a copy (pointer-generator) head over the lemma
characters. Tag tokens precede the characters as in Kann & Schütze (2016); the copy head
follows See et al. (2017) as used for low-resource inflection by Sharma et al. (2018).
The models differ only in how the UniMorph bundle enters the encoder:

    natom   the whole bundle is ONE token (atomic tag), the neural analogue of the
            atomic-tag rule baseline; an unseen bundle becomes <unk-tag>;
    nfeat   the bundle is decomposed: each feature is its own token (feature-aware),
            so an unseen combination of seen features is still representable.

Architecture, hyperparameters, schedule and seeds are identical, so the difference between
the two isolates tag decomposition. There is no development set: the schedule is fixed in
advance (see CFG), because the rule systems get no tuning data either.

A small Transformer (the SIGMORPHON 2020 baseline design) was tried first and dropped: at
the update budget a CPU allows it had not learned to copy after 120 epochs on 100 items
(0% accuracy), while this recurrent model with copying learns within a few hundred updates.

Output: experiments/neural/<dataset>.json.gz, keyed "seed|split|n" -> {natom, nfeat}, each
a list of predicted forms aligned with the test set. run-experiment.mjs scores them with the
same metrics and paired bootstrap as the other systems.

Usage:
    py scripts/neural.py [--workers 6] [--datasets tur urd] [--sizes 500] [--seeds 1]
Finished runs are cached in unimorph-data/neural-cache/, so an interrupted run resumes.
"""

import argparse
import gzip
import json
import math
import os
import random
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed

import torch
import torch.nn as nn
import torch.nn.functional as F

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD, BOS, EOS = 0, 1, 2
SPECIALS = 3
SPLITS = ["random", "lemma-disjoint"]
KINDS = ["natom", "nfeat"]

CFG = {
    "emb": 48,
    "enc": 64,  # per direction
    "dec": 128,
    "dropout": 0.3,
    "lr": 3e-3,
    "lr_final": 3e-4,  # cosine decay to this
    "batch": 32,
    "clip": 5.0,
    # fixed update schedule: steps = min(max, base + per_item * n)
    "steps_base": 200,
    "steps_per_item": 0.6,
    "steps_max": 800,
    "decode_extra": 20,
}


def steps_for(n):
    return int(min(CFG["steps_max"], CFG["steps_base"] + CFG["steps_per_item"] * n))


def tag_tokens(tag, kind):
    return [tag] if kind == "natom" else tag.split(";")


class Vocab:
    """Characters are the dataset alphabet; tag tokens come from the TRAINING items only."""

    def __init__(self, chars, train_tags):
        self.char_id = {c: i + SPECIALS for i, c in enumerate(sorted(chars))}
        self.id_char = {i: c for c, i in self.char_id.items()}
        self.nchar = SPECIALS + len(self.char_id)
        self.tag_unk = self.nchar
        self.tag_id = {t: self.nchar + 1 + i for i, t in enumerate(sorted(train_tags))}
        self.size = self.nchar + 1 + len(self.tag_id)

    def src(self, lemma, tags):
        return [self.tag_id.get(t, self.tag_unk) for t in tags] + [self.char_id[c] for c in lemma]

    def tgt(self, form):
        return [self.char_id[c] for c in form] + [EOS]

    def decode(self, ids):
        return "".join(self.id_char.get(i, "") for i in ids)


class PointerGenerator(nn.Module):
    """Only the recurrence runs per character; output layers run once over all positions."""

    def __init__(self, V):
        super().__init__()
        E, H, D = CFG["emb"], CFG["enc"], CFG["dec"]
        self.src_emb = nn.Embedding(V.size, E, padding_idx=PAD)
        self.tgt_emb = nn.Embedding(V.nchar, E, padding_idx=PAD)
        self.encoder = nn.LSTM(E, H, batch_first=True, bidirectional=True)
        self.bridge = nn.Linear(2 * H, 2 * D)
        self.decoder = nn.LSTMCell(E + 2 * H, D)
        self.attn = nn.Linear(D, 2 * H, bias=False)
        self.out = nn.Linear(D + 2 * H, D)
        self.proj = nn.Linear(D, V.nchar)
        self.gen = nn.Linear(D + 2 * H + E, 1)
        self.drop = nn.Dropout(CFG["dropout"])

    def encode(self, b):
        x = self.drop(self.src_emb(b["src"]))
        packed = nn.utils.rnn.pack_padded_sequence(x, b["lens"], batch_first=True, enforce_sorted=False)
        enc, _ = self.encoder(packed)
        enc, _ = nn.utils.rnn.pad_packed_sequence(enc, batch_first=True, total_length=b["src"].size(1))
        mean = (enc * b["mask"].unsqueeze(-1)).sum(1) / b["lens"].unsqueeze(-1).float()
        h0, c0 = torch.tanh(self.bridge(mean)).chunk(2, -1)
        return enc, (h0.contiguous(), c0.contiguous())

    def recur(self, e_t, state, ctx, enc, neg_mask):
        """One decoder step: new state, attention weights over all source positions, context."""
        h, c = self.decoder(torch.cat([e_t, ctx], -1), state)
        a = F.softmax(torch.bmm(enc, self.attn(h).unsqueeze(2)).squeeze(2) + neg_mask, -1)
        ctx = torch.bmm(a.unsqueeze(1), enc).squeeze(1)
        return (h, c), a, ctx

    def mix(self, h, ctx, e, a, b):
        """Output distribution from [.., D] states (any leading shape): generate or copy a lemma character."""
        o = torch.tanh(self.out(torch.cat([h, ctx], -1)))
        p_vocab = F.softmax(self.proj(self.drop(o)), -1)
        p_gen = torch.sigmoid(self.gen(torch.cat([h, ctx, e], -1)))
        copy, idx = b["copy"], b["src_chars"]
        if a.dim() == 3:  # [B, T, S]: all target positions at once
            copy, idx = copy.unsqueeze(1), idx.unsqueeze(1).expand_as(a)
        ac = a * copy
        ac = ac / ac.sum(-1, keepdim=True).clamp_min(1e-9)
        p_copy = torch.zeros_like(p_vocab).scatter_add(-1, idx, ac)
        return p_gen * p_vocab + (1 - p_gen) * p_copy

    def forward(self, b, y_in):
        enc, state = self.encode(b)
        E = self.drop(self.tgt_emb(y_in))
        ctx = torch.zeros(y_in.size(0), enc.size(-1))
        hs, cs, As = [], [], []
        for t in range(y_in.size(1)):
            state, a, ctx = self.recur(E[:, t], state, ctx, enc, b["neg_mask"])
            hs.append(state[0])
            cs.append(ctx)
            As.append(a)
        return self.mix(torch.stack(hs, 1), torch.stack(cs, 1), E, torch.stack(As, 1), b)


def batchify(V, rows, kind):
    srcs = [V.src(lemma, tag_tokens(tag, kind)) for lemma, tag, _ in rows]
    lens = torch.tensor([len(s) for s in srcs])
    src = torch.full((len(srcs), int(lens.max())), PAD, dtype=torch.long)
    for i, s in enumerate(srcs):
        src[i, : len(s)] = torch.tensor(s)
    mask = src != PAD
    is_char = (src >= SPECIALS) & (src < V.nchar)
    return {
        "src": src,
        "lens": lens,
        "mask": mask,
        "neg_mask": torch.zeros(src.shape).masked_fill(~mask, -1e9),
        "copy": is_char.float(),
        "src_chars": torch.where(is_char, src, torch.zeros_like(src)),
    }


def targets(V, rows):
    tg = [V.tgt(form) for _, _, form in rows]
    T = max(len(t) for t in tg)
    y = torch.full((len(tg), T), PAD, dtype=torch.long)
    for i, t in enumerate(tg):
        y[i, : len(t)] = torch.tensor(t)
    y_in = torch.cat([torch.full((len(tg), 1), BOS, dtype=torch.long), y[:, :-1]], 1)
    y_in = y_in.masked_fill(y_in == EOS, PAD)
    return y_in, y


def train_model(V, rows, kind, seed):
    torch.manual_seed(seed)
    rnd = random.Random(seed)
    model = PointerGenerator(V)
    opt = torch.optim.Adam(model.parameters(), lr=CFG["lr"])
    steps = steps_for(len(rows))
    order, pos = [], 0
    losses = []
    model.train()
    for step in range(steps):
        lr = CFG["lr_final"] + 0.5 * (CFG["lr"] - CFG["lr_final"]) * (1 + math.cos(math.pi * step / steps))
        for g in opt.param_groups:
            g["lr"] = lr
        if pos + CFG["batch"] > len(order):
            order, pos = rnd.sample(range(len(rows)), len(rows)), 0
        batch = [rows[i] for i in order[pos : pos + CFG["batch"]]]
        pos += CFG["batch"]
        b = batchify(V, batch, kind)
        y_in, y = targets(V, batch)
        p = model(b, y_in)
        nll = -torch.log(p.gather(2, y.unsqueeze(-1)).squeeze(-1) + 1e-12)
        keep = (y != PAD).float()
        loss = (nll * keep).sum() / keep.sum()
        opt.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), CFG["clip"])
        opt.step()
        losses.append(loss.item())
    return model, steps, sum(losses[-50:]) / len(losses[-50:])


@torch.no_grad()
def predict(model, V, rows, kind):
    model.eval()
    preds = []
    for k in range(0, len(rows), 256):
        chunk = rows[k : k + 256]
        b = batchify(V, chunk, kind)
        enc, state = model.encode(b)
        ctx = torch.zeros(len(chunk), enc.size(-1))
        y = torch.full((len(chunk),), BOS, dtype=torch.long)
        done = torch.zeros(len(chunk), dtype=torch.bool)
        out = []
        max_len = max(len(lemma) for lemma, _, _ in chunk) + CFG["decode_extra"]
        for _ in range(max_len):
            e = model.tgt_emb(y)
            state, a, ctx = model.recur(e, state, ctx, enc, b["neg_mask"])
            y = model.mix(state[0], ctx, e, a, b).argmax(-1)
            y = torch.where(done, torch.full_like(y, EOS), y)
            out.append(y)
            done |= y == EOS
            if bool(done.all()):
                break
        for row in torch.stack(out, 1).tolist():
            preds.append(V.decode(row[: row.index(EOS)] if EOS in row else row))
    return preds


_DATA = {}


def load_splits(path):
    if path not in _DATA:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        chars = set()
        for s in d["seeds"].values():
            for part in s.values():
                for rows in part.values():
                    for lemma, _, form in rows:
                        chars.update(lemma)
                        chars.update(form)
        _DATA[path] = (d, chars)
    return _DATA[path]


def run_job(job):
    torch.set_num_threads(1)
    ds, seed, split, n, kind, splits_path, cache_path = job
    d, chars = load_splits(splits_path)
    part = d["seeds"][str(seed)][split]
    train_rows = part["pool"][:n]
    test_rows = part["test"]
    V = Vocab(chars, {t for _, tag, _ in train_rows for t in tag_tokens(tag, kind)})
    t0 = time.time()
    run_seed = seed * 100003 + n * 7 + SPLITS.index(split)
    model, steps, loss = train_model(V, train_rows, kind, run_seed)
    preds = predict(model, V, test_rows, kind)
    acc = 100 * sum(p == r[2] for p, r in zip(preds, test_rows)) / len(test_rows)
    res = {"preds": preds, "steps": steps, "loss": round(loss, 4), "seconds": round(time.time() - t0, 1), "acc": round(acc, 1)}
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False)
    return job, res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=os.path.join(ROOT, "unimorph-data"))
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2)))
    ap.add_argument("--datasets", nargs="*")
    ap.add_argument("--seeds", nargs="*", type=int)
    ap.add_argument("--sizes", nargs="*", type=int)
    ap.add_argument("--splits", nargs="*", choices=SPLITS)
    ap.add_argument("--no-write", action="store_true", help="train and cache only; do not write experiments/neural")
    args = ap.parse_args()

    split_dir = os.path.join(args.data, "splits")
    cache_dir = os.path.join(args.data, "neural-cache")
    datasets = args.datasets or sorted(f[:-5] for f in os.listdir(split_dir) if f.endswith(".json"))

    jobs, todo = {}, []
    for ds in datasets:
        path = os.path.join(split_dir, f"{ds}.json")
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        for seed in args.seeds or [int(s) for s in d["seeds"]]:
            for split in args.splits or SPLITS:
                part = d["seeds"][str(seed)][split]
                for n in args.sizes or d["sizes"]:
                    if len(part["pool"]) < n:
                        continue
                    for kind in KINDS:
                        cache = os.path.join(cache_dir, ds, f"{seed}_{split}_{n}_{kind}.json")
                        job = (ds, seed, split, n, kind, path, cache)
                        jobs.setdefault(ds, []).append(job)
                        if not os.path.exists(cache):
                            todo.append(job)

    todo.sort(key=lambda j: -j[3])  # longest runs first
    print(f"{sum(len(v) for v in jobs.values())} runs, {len(todo)} to train, {args.workers} workers", flush=True)
    t0 = time.time()
    if todo:
        with ProcessPoolExecutor(max_workers=args.workers) as ex:
            futures = [ex.submit(run_job, j) for j in todo]
            for k, fut in enumerate(as_completed(futures), 1):
                (ds, seed, split, n, kind, _, _), res = fut.result()
                print(f"[{k}/{len(todo)} {time.time() - t0:6.0f}s] {ds} seed={seed} {split} n={n} {kind}: acc {res['acc']:.1f} loss {res['loss']:.3f} ({res['seconds']}s)", flush=True)

    if args.no_write:
        return
    out_dir = os.path.join(ROOT, "experiments", "neural")
    os.makedirs(out_dir, exist_ok=True)
    for ds, ds_jobs in jobs.items():
        out = {"_meta": {"config": CFG, "torch": torch.__version__, "python": sys.version.split()[0], "kinds": KINDS, "runs": {}}}
        for _, seed, split, n, kind, _, cache in ds_jobs:
            with open(cache, encoding="utf-8") as f:
                res = json.load(f)
            out.setdefault(f"{seed}|{split}|{n}", {})[kind] = res["preds"]
            out["_meta"]["runs"][f"{seed}|{split}|{n}|{kind}"] = {k: res[k] for k in ("steps", "loss", "seconds", "acc")}
        target = os.path.join(out_dir, f"{ds}.json.gz")
        with gzip.open(target, "wt", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False)
        print("wrote", target, flush=True)


if __name__ == "__main__":
    main()
