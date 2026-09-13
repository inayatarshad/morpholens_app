"use client";

import { useState } from "react";
import { task } from "@/data/experiments";
import type { ExperimentSplit, LanguageId, TrainingSize } from "@/data/types";
import { ExperimentControls } from "./ExperimentControls";
import { ExperimentChart, LearningCurve } from "./ExperimentChart";
import { GeneralisationGap } from "./GeneralisationGap";
import { PredictionExample } from "./PredictionExample";

export function ExperimentWorkspace() {
  const [lang, setLang] = useState<LanguageId>("tur");
  const [split, setSplit] = useState<ExperimentSplit>("random");
  const [size, setSize] = useState<TrainingSize>(500);

  return (
    <div className="space-y-6">
      <ExperimentControls lang={lang} split={split} size={size} onLang={setLang} onSplit={setSplit} onSize={setSize} />

      <p className="text-xs text-muted">
        Task: <span className="text-ink">{task.name}</span> — {task.description} · Metric: {task.metric}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ExperimentChart lang={lang} split={split} size={size} />
        <GeneralisationGap lang={lang} size={size} split={split} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <LearningCurve lang={lang} split={split} />
        <PredictionExample lang={lang} />
      </div>
    </div>
  );
}
