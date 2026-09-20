"use client";

import { useState } from "react";
import { AudioLines, Scale, ShieldAlert } from "lucide-react";
import { CorePipeline } from "@/components/core-pipeline";
import { RiskRing } from "@/components/risk-ring";
import { clsx } from "@/lib/format";
import { VERDICT_LABEL, type Verdict } from "@/lib/types";

const CASES: {
  id: string;
  title: string;
  blurb: string;
  auth: number;
  fraud: number;
  authBand: "genuine" | "review" | "high";
  fraudBand: "genuine" | "review" | "high";
  verdict: Verdict;
}[] = [
  {
    id: "human-scam",
    title: "Human + scam script",
    blurb: "Voice looks real. Words still ask for a transfer.",
    auth: 18,
    fraud: 86,
    authBand: "genuine",
    fraudBand: "high",
    verdict: "fraud_human",
  },
  {
    id: "clone-otp",
    title: "Clone + OTP ask",
    blurb: "Synthetic voice and a secret request at once.",
    auth: 84,
    fraud: 78,
    authBand: "high",
    fraudBand: "high",
    verdict: "critical",
  },
  {
    id: "clone-hello",
    title: "Clone saying hello",
    blurb: "Synthetic, but not asking for money or codes.",
    auth: 81,
    fraud: 8,
    authBand: "high",
    fraudBand: "genuine",
    verdict: "synthetic_benign",
  },
  {
    id: "genuine",
    title: "Saved contact",
    blurb: "Human voice, no fraud language in the window.",
    auth: 12,
    fraud: 6,
    authBand: "genuine",
    fraudBand: "genuine",
    verdict: "clear",
  },
];

const VERDICTS: { id: Verdict; why: string }[] = [
  { id: "clear", why: "Both scores stay low" },
  { id: "review", why: "One layer is uncertain" },
  { id: "fraud_human", why: "Real voice, scam words" },
  { id: "synthetic_benign", why: "Clone, no ask" },
  { id: "critical", why: "Clone and a secret ask" },
];

export function LandingCoreStory() {
  const [caseId, setCaseId] = useState(CASES[0].id);
  const selected = CASES.find((c) => c.id === caseId) ?? CASES[0];

  return (
    <section id="core" className="core-story">
      <div className="core-story-glow" aria-hidden />
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">Why two scores</p>
          <h2 className="font-serif mt-4 text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            A blended risk number{" "}
            <span className="italic text-[var(--accent)]">hides the common case.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            A real person reading a scam script is still a scam. A clone saying hello is not yet
            a transfer. Core answers both questions, then the host decides.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <article className="core-pillar">
            <AudioLines size={18} className="text-[var(--accent)]" />
            <h3 className="mt-3 font-medium">Authenticity</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Is this voice synthetic or cloned? Neural models plus DSP that fail in different ways.
            </p>
          </article>
          <article className="core-pillar">
            <ShieldAlert size={18} className="text-[var(--accent-2)]" />
            <h3 className="mt-3 font-medium">Fraud</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Do the words look like OTP theft, coercion, or a high-value transfer under secrecy?
            </p>
          </article>
          <article className="core-pillar">
            <Scale size={18} className="text-[var(--accent)]" />
            <h3 className="mt-3 font-medium">Host policy</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Warn, hold, MFA, or cut. Core never moves money — adapters apply the rule.
            </p>
          </article>
        </div>

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
              Illustrative matrix — not a live score
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CASES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCaseId(item.id)}
                  className={clsx("core-case", caseId === item.id && "is-active")}
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="mt-1 block text-[12px] leading-5 text-[var(--muted)]">{item.blurb}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--faint)]">
              Click a case. The rings show how authenticity and fraud can disagree — that
              disagreement is the product.
            </p>
          </div>

          <div className="core-case-stage">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="kicker">Fusion</div>
                <div className="mt-1 font-serif text-2xl capitalize">
                  {VERDICT_LABEL[selected.verdict]}
                </div>
              </div>
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
                Demo rings
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
              <RiskRing title="Authenticity" score={selected.auth} band={selected.authBand} size={156} />
              <RiskRing title="Fraud" score={selected.fraud} band={selected.fraudBand} size={156} />
            </div>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">Five verdicts</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {VERDICTS.map((v) => (
              <span
                key={v.id}
                className={clsx("verdict-pill", selected.verdict === v.id && "is-active")}
              >
                <strong>{VERDICT_LABEL[v.id]}</strong>
                <span>{v.why}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <p className="mb-5 text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
            Same path for every host
          </p>
          <CorePipeline complete />
        </div>
      </div>
    </section>
  );
}
