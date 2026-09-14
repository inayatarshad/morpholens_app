"use client";

import { useState } from "react";
import { experiment, sizesFor, task, type Metric } from "@/data/experiments";
import type { ExperimentSplit, LanguageId } from "@/data/types";
import { BreakdownPanel } from "./BreakdownPanel";
import { ExperimentControls } from "./ExperimentControls";
import { ExperimentChart, LearningCurve } from "./ExperimentChart";
import { GeneralisationGap } from "./GeneralisationGap";
import { PredictionExample } from "./PredictionExample";

export function ExperimentWorkspace() {
  const [lang, setLang] = useState<LanguageId>("tur");
  const [split, setSplit] = useState<ExperimentSplit>("random");
  const [sizePref, setSizePref] = useState(1000);
  const [metric, setMetric] = useState<Metric>("strict");

  const sizes = sizesFor(lang);
  const size = sizes.includes(sizePref) ? sizePref : (sizes.filter((s) => s <= sizePref).pop() ?? sizes[0]);
  const stats = experiment.stats[lang];

  return (
    <div className="space-y-6">
      <ExperimentControls
        lang={lang}
        split={split}
        size={size}
        sizes={sizes}
        metric={metric}
        onLang={setLang}
        onSplit={setSplit}
        onSize={setSizePref}
        onMetric={setMetric}
      />

      <p className="text-xs text-muted">
        Task: <span className="text-ink">{task.name}</span>. {task.description} · mean ± s.d. over 5 seeds · test set of {stats.testSize} items per seed (at most {experiment.config.testMax}; {Math.round(experiment.config.testFraction * 100)}% of the sampled records when that is smaller) ·
        data: {stats.triples.toLocaleString("en")} UniMorph triples
        {stats.note ? ` (${stats.note})` : ""}
        {stats.excludedAnomalies ? `, ${stats.excludedAnomalies} records with non-schema tags excluded` : ""}.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ExperimentChart lang={lang} split={split} size={size} metric={metric} />
        <GeneralisationGap lang={lang} size={size} split={split} metric={metric} />
      </div>

      <BreakdownPanel lang={lang} split={split} size={size} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <LearningCurve lang={lang} split={split} metric={metric} />
        <PredictionExample lang={lang} split={split} />
      </div>
    </div>
  );
}
