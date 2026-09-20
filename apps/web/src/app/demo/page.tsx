"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageIntro } from "@/components/atmosphere";
import { CorePipeline, PIPELINE_STEPS } from "@/components/core-pipeline";
import { EvidenceBrief } from "@/components/evidence-brief";
import { RiskRing } from "@/components/risk-ring";
import { clsx } from "@/lib/format";
import { scoreText } from "@/sdk";
import { VERDICT_LABEL, type EngineOk } from "@/lib/types";

const DEMOS = [
  {
    id: "family",
    title: "Family UPI",
    blurb: "Urgent transfer request from a parent-like voice.",
    transcript:
      "Beta, mujhe abhi paise chahiye. UPI pe do lakh bhej do. Kisi ko mat batana. OTP bhej dena jaldi.",
  },
  {
    id: "cfo",
    title: "CFO wire",
    blurb: "High-value vendor payout under time pressure.",
    transcript:
      "This is Rohan, the CFO. Transfer twelve lakh forty thousand to the vendor now. Do not call anyone. Send me the OTP from the bank SMS.",
  },
  {
    id: "otp",
    title: "OTP tax",
    blurb: "Official-sounding freeze threat + OTP harvest.",
    transcript:
      "Income Tax department. Confirm the OTP I just sent or your account will be frozen within thirty minutes.",
  },
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function JudgeDemoPage() {
  const [busy, setBusy] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [result, setResult] = useState<EngineOk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policy, setPolicy] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const [typed, setTyped] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const runId = useRef(0);
  const typeTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typeTimer.current) window.clearInterval(typeTimer.current);
    };
  }, []);

  function pushLog(line: string) {
    const stamp = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLog((prev) => [`${stamp}  ${line}`, ...prev].slice(0, 8));
  }

  function typeTranscript(text: string, token: number) {
    if (typeTimer.current) window.clearInterval(typeTimer.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(text);
      return;
    }
    setTyped("");
    let i = 0;
    typeTimer.current = window.setInterval(() => {
      if (token !== runId.current) {
        if (typeTimer.current) window.clearInterval(typeTimer.current);
        return;
      }
      i = Math.min(text.length, i + 3);
      setTyped(text.slice(0, i));
      if (i >= text.length && typeTimer.current) {
        window.clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    }, 18);
  }

  async function run(id: (typeof DEMOS)[number]["id"]) {
    const demo = DEMOS.find((d) => d.id === id);
    if (!demo) return;
    const token = ++runId.current;
    setBusy(true);
    setActiveId(id);
    setError(null);
    setPolicy(null);
    setResult(null);
    setStep(0);
    typeTranscript(demo.transcript, token);
    pushLog(`POST /score-text  scenario=${id}`);

    const scoredPromise = scoreText(demo.transcript, {
      preset: id === "family" ? "standard" : "high_value",
      context: {
        unknownNumber: true,
        knownContact: false,
        highValue: id !== "family",
        callOrigin: "unknown",
      },
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (let i = 1; i < PIPELINE_STEPS.length - 1; i++) {
      if (!reduce) await sleep(220);
      if (token !== runId.current) return;
      setStep(i);
    }

    try {
      const scored = await scoredPromise;
      if (token !== runId.current) return;
      setStep(PIPELINE_STEPS.length - 1);
      setResult(scored);
      pushLog(`verdict=${scored.verdict}  auth=${scored.authenticity.score}  fraud=${scored.fraud.score}`);
      if (
        scored.verdict === "critical" ||
        scored.verdict === "fraud_human" ||
        scored.fraud.band === "high"
      ) {
        setPolicy("Host preview: auto Hold + MFA / callback before any transfer.");
      } else if (scored.verdict === "review") {
        setPolicy("Host preview: soft warn + secondary verification.");
      } else {
        setPolicy("Host preview: continue under normal controls.");
      }
    } catch (err) {
      if (token !== runId.current) return;
      setStep(-1);
      const message = err instanceof Error ? err.message : "Core unreachable.";
      setError(message);
      pushLog(`error  ${message}`);
    } finally {
      if (token === runId.current) setBusy(false);
    }
  }

  const active = DEMOS.find((d) => d.id === activeId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        kicker="Judge demo"
        title="One click. No mic required."
        body="Three canned scam scripts hit POST /score-text. Watch ingest → authenticity → fraud → fusion → host policy, then the Evidence Brief."
      />

      <CorePipeline
        activeIndex={busy ? Math.max(0, step) : -1}
        complete={Boolean(result) && !busy}
        compact
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <section className="space-y-3">
          {DEMOS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              disabled={busy}
              onClick={() => void run(demo.id)}
              className={clsx(
                "card w-full p-5 text-left transition hover:-translate-y-0.5 disabled:opacity-70",
                demo.id === activeId && "ring-1 ring-[var(--accent)]/45",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="kicker">
                  {demo.id === activeId && busy ? "Scoring…" : "Scenario"}
                </div>
                {demo.id === activeId && result ? (
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
                    {VERDICT_LABEL[result.verdict]}
                  </span>
                ) : null}
              </div>
              <div className="font-serif mt-2 text-2xl">{demo.title}</div>
              <p className="mt-2 text-sm text-[var(--muted)]">{demo.blurb}</p>
            </button>
          ))}
        </section>

        <aside className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="kicker">Live console</div>
            <span className="font-mono text-[10px] text-[var(--faint)]">/score-text</span>
          </div>
          <div className="demo-script" aria-live="polite">
            {typed || active?.transcript || (
              <span className="text-[var(--faint)]">Pick a script. The transcript appears here while Core scores.</span>
            )}
            {busy && typed.length < (active?.transcript.length ?? 0) ? (
              <span className="demo-script-caret" aria-hidden />
            ) : null}
          </div>
          <pre className="max-h-36 overflow-auto rounded-xl border border-[var(--line)] bg-black/40 p-3 font-mono text-[11px] leading-5 text-[var(--muted)]">
            {log.length
              ? log.join("\n")
              : `curl -s http://127.0.0.1:8000/v1/capabilities
curl -s -F text="send OTP now" \\
  -F preset=high_value \\
  http://127.0.0.1:8000/score-text`}
          </pre>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link href="/guide" className="text-[var(--accent)]">
              Guide
            </Link>
            <Link href="/adapters/bank" className="text-[var(--accent)]">
              Bank adapter
            </Link>
            <Link href="/monitor" className="text-[var(--accent)]">
              Call adapter
            </Link>
          </div>
          {error ? <p className="text-sm text-[var(--high)]">{error}</p> : null}
          {policy ? (
            <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-3 py-2 text-xs text-[var(--accent)]">
              {policy}
            </p>
          ) : null}
        </aside>
      </div>

      {result ? (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="card flex flex-col items-center gap-6 p-6">
            <div className="text-center">
              <div className="kicker">Core verdict</div>
              <div className="font-serif mt-1 text-2xl capitalize">{VERDICT_LABEL[result.verdict]}</div>
            </div>
            <RiskRing title="Authenticity" score={result.authenticity.score} band={result.authenticity.band} size={140} />
            <RiskRing title="Fraud" score={result.fraud.score} band={result.fraud.band} size={140} />
          </div>
          <EvidenceBrief result={result} />
        </div>
      ) : (
        <p className="text-center text-sm text-[var(--faint)]">
          Scores stay empty until a scenario runs — Core does not guess on silence.
        </p>
      )}
    </div>
  );
}
