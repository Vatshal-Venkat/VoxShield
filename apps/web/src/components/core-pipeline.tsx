"use client";

import { clsx } from "@/lib/format";

export const PIPELINE_STEPS = [
  { id: "ingest", label: "Ingest", hint: "Mic, file, or transcript" },
  { id: "auth", label: "Authenticity", hint: "AST · wav2vec2 · DSP" },
  { id: "fraud", label: "Fraud", hint: "Whisper · SilverGuard · lexicon" },
  { id: "fusion", label: "Fusion", hint: "Two scores, five verdicts" },
  { id: "host", label: "Host policy", hint: "Warn · Hold · MFA · Cut" },
] as const;

export type PipelineStepId = (typeof PIPELINE_STEPS)[number]["id"];

export function CorePipeline({
  activeIndex = -1,
  complete = false,
  compact = false,
}: {
  /** 0-based step currently running. -1 = idle showcase. */
  activeIndex?: number;
  complete?: boolean;
  compact?: boolean;
}) {
  return (
    <ol
      className={clsx("core-pipeline", compact && "core-pipeline--compact")}
      aria-label="VoxShield Core pipeline"
    >
      {PIPELINE_STEPS.map((step, i) => {
        const done = complete || (activeIndex >= 0 && i < activeIndex);
        const current = !complete && activeIndex === i;
        return (
          <li
            key={step.id}
            className={clsx(
              "core-pipeline-step",
              done && "is-done",
              current && "is-current",
            )}
          >
            <span className="core-pipeline-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="core-pipeline-label">{step.label}</span>
            {!compact ? <span className="core-pipeline-hint">{step.hint}</span> : null}
            {i < PIPELINE_STEPS.length - 1 ? <span className="core-pipeline-join" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
