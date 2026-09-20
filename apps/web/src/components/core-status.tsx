"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/sdk";
import { clsx } from "@/lib/format";
import type { EngineHealth } from "@/lib/types";

export function CoreStatus({ className }: { className?: string }) {
  const [health, setHealth] = useState<EngineHealth | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const next = await fetchHealth();
      if (!alive) return;
      setHealth(next);
      setChecked(true);
    };
    void tick();
    const id = window.setInterval(() => void tick(), 12_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const online = Boolean(health) && !health?.warming;
  const warming = Boolean(health?.warming);
  const label = !checked ? "Checking Core" : warming ? "Core warming" : online ? "Core online" : "Core offline";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
        online
          ? "border-[var(--genuine)]/35 bg-[var(--genuine)]/10 text-[var(--genuine)]"
          : warming
            ? "border-[var(--review)]/35 bg-[var(--review)]/10 text-[var(--review)]"
            : "border-[var(--line)] text-[var(--muted)]",
        className,
      )}
      title={health ? `profile ${health.profile} · v${health.engine_version}` : "Engine health"}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          online ? "live-dot bg-[var(--genuine)]" : warming ? "live-dot bg-[var(--review)]" : "bg-[var(--faint)]",
        )}
      />
      {label}
    </span>
  );
}
