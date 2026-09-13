"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCell, sizesFor, systemOrder, systems } from "@/data/experiments";
import type { ExperimentSplit, LanguageId } from "@/data/types";
import { StatusTag } from "./ResearchBadge";

const C = { bush: "#102e28", line: "rgba(16,46,40,0.12)", muted: "#6f6a60" };
const tooltipStyle = { background: "#f6f1e7", border: "1px solid rgba(16,46,40,0.2)", borderRadius: 8, fontSize: 12 };

export function ExperimentChart({ lang, split, size }: { lang: LanguageId; split: ExperimentSplit; size: number }) {
  const data = (["random", "lemma-disjoint"] as ExperimentSplit[]).map((s) => {
    const cell = getCell(lang, s, size);
    const row: Record<string, string | number> = { split: s === "random" ? "Random split" : "Lemma-disjoint split", key: s };
    for (const m of systemOrder) {
      row[m] = cell?.systems[m].mean ?? 0;
      row[`${m}Err`] = cell?.systems[m].std ?? 0;
    }
    return row;
  });

  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Accuracy by evaluation split · n = {size}</p>
        <StatusTag label="MEASURED · 5 SEEDS" />
      </div>
      <div className="mt-4 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="22%" margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="split" tick={{ fill: C.bush, fontSize: 13 }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(210,183,146,0.18)" }} />
            <Legend iconType="square" wrapperStyle={{ fontSize: 12, color: C.bush }} />
            {systemOrder.map((m) => (
              <Bar
                key={m}
                dataKey={m}
                name={systems[m].name}
                fill={systems[m].color}
                radius={[4, 4, 0, 0]}
                animationDuration={600}
                label={{ position: "insideTop", fill: m === "baseline" ? C.bush : "#f6f1e7", fontSize: 11, offset: 8 }}
              >
                {data.map((d) => (
                  <Cell key={String(d.key)} fillOpacity={d.key === split ? 1 : 0.32} />
                ))}
                <ErrorBar dataKey={`${m}Err`} width={4} strokeWidth={1.2} stroke={C.bush} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">Bars: mean exact-match accuracy; whiskers: ±1 s.d. across seeds. The selected split is shown at full opacity.</p>
    </div>
  );
}

export function LearningCurve({ lang, split }: { lang: LanguageId; split: ExperimentSplit }) {
  const data = sizesFor(lang).map((n) => {
    const cell = getCell(lang, split, n);
    return { n, ...Object.fromEntries(systemOrder.map((m) => [m, cell?.systems[m].mean ?? null])) };
  });
  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Learning curve · {split}</p>
        <StatusTag label="MEASURED" />
      </div>
      <div className="mt-4 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="n" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `${l} training examples`} />
            {systemOrder.map((m) => (
              <Line key={m} type="monotone" dataKey={m} name={systems[m].name} stroke={systems[m].color} strokeWidth={2.5} dot={{ r: 3.5, fill: systems[m].color }} animationDuration={600} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
