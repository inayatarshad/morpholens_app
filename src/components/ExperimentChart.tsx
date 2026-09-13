"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getResult, trainingSizes } from "@/data/experiments";
import type { ExperimentSplit, LanguageId, TrainingSize } from "@/data/types";
import { IllustrativeTag } from "./ResearchBadge";

const C = {
  bush: "#102e28",
  oak: "#d2b792",
  sienna: "#a94f24",
  line: "rgba(16,46,40,0.12)",
  muted: "#6f6a60",
};

const tooltipStyle = {
  background: "#f6f1e7",
  border: "1px solid rgba(16,46,40,0.2)",
  borderRadius: 8,
  fontSize: 12,
};

export function ExperimentChart({ lang, split, size }: { lang: LanguageId; split: ExperimentSplit; size: TrainingSize }) {
  const data = (["random", "lemma-disjoint"] as ExperimentSplit[]).map((s) => ({
    split: s === "random" ? "Random split" : "Lemma-disjoint split",
    key: s,
    Baseline: getResult(lang, s, size, "baseline"),
    "Morphology-aware": getResult(lang, s, size, "morph"),
  }));

  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Accuracy by evaluation split · n = {size}</p>
        <IllustrativeTag />
      </div>
      <div className="mt-4 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} barCategoryGap="28%" margin={{ top: 24, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="split" tick={{ fill: C.bush, fontSize: 13 }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(210,183,146,0.18)" }} />
            <Legend iconType="square" wrapperStyle={{ fontSize: 12, color: C.bush }} />
            <Bar dataKey="Baseline" fill={C.oak} radius={[4, 4, 0, 0]} animationDuration={700} label={{ position: "top", fill: C.bush, fontSize: 12 }}>
              {data.map((d) => (
                <Cell key={d.key} fillOpacity={d.key === split ? 1 : 0.35} stroke={C.bush} strokeOpacity={0.25} />
              ))}
            </Bar>
            <Bar dataKey="Morphology-aware" fill={C.bush} radius={[4, 4, 0, 0]} animationDuration={700} label={{ position: "top", fill: C.bush, fontSize: 12 }}>
              {data.map((d) => (
                <Cell key={d.key} fill={d.key === "lemma-disjoint" ? C.sienna : C.bush} fillOpacity={d.key === split ? 1 : 0.35} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">
        Illustrative experiment — replace with measured results after model evaluation. The selected split is shown at full
        opacity.
      </p>
    </div>
  );
}

export function LearningCurve({ lang, split }: { lang: LanguageId; split: ExperimentSplit }) {
  const data = trainingSizes.map((n) => ({
    n,
    Baseline: getResult(lang, split, n, "baseline"),
    "Morphology-aware": getResult(lang, split, n, "morph"),
  }));
  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Few-shot learning curve · {split === "random" ? "random" : "lemma-disjoint"}</p>
        <IllustrativeTag />
      </div>
      <div className="mt-4 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="n" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis domain={[20, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `${l} training examples`} />
            <Line type="monotone" dataKey="Baseline" stroke={C.oak} strokeWidth={2.5} dot={{ r: 4, fill: C.oak }} animationDuration={700} />
            <Line
              type="monotone"
              dataKey="Morphology-aware"
              stroke={split === "random" ? C.bush : C.sienna}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
