"use client";

import { useState } from "react";
import { experiment, sizesFor, task } from "@/data/experiments";
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

  const sizes = sizesFor(lang);
  const size = sizes.includes(sizePref) ? sizePref : (sizes.filter((s) => s <= sizePref).pop() ?? sizes[0]);
  const stats = experiment.stats[lang];

  return (
    <div className="space-y-6">
      <ExperimentControls lang={lang} split={split} size={size} sizes={sizes} onLang={setLang} onSplit={setSplit} onSize={setSizePref} />

      <p className="text-xs text-muted">
        Task: <span className="text-ink">{task.name}</span> — {task.description} · {task.metric} · test set {stats.testSize} items per
        seed · data: {stats.triples.toLocaleString("en")} UniMorph triples.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ExperimentChart lang={lang} split={split} size={size} />
        <GeneralisationGap lang={lang} size={size} split={split} />
      </div>

      <BreakdownPanel lang={lang} split={split} size={size} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <LearningCurve lang={lang} split={split} />
        <PredictionExample lang={lang} split={split} />
      </div>
    </div>
  );
}
