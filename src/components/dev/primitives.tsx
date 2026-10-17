import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/dev/logic";
import { LEVELS, type CriterionStatus, type GoalStatus, type Level } from "@/lib/dev/types";

const pill = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] whitespace-nowrap", {
  variants: {
    tone: {
      success: "bg-success-soft text-success",
      warning: "bg-warning-soft text-warning",
      info: "bg-info-soft text-info",
      muted: "bg-muted text-muted-foreground",
    },
  },
});

const STATUS_TONE: Record<GoalStatus, "success" | "warning" | "info" | "muted"> = {
  on_track: "success",
  needs_attention: "warning",
  review_due: "info",
  completed: "muted",
  paused: "muted",
};

export function Pill({ tone, children }: { tone: "success" | "warning" | "info" | "muted"; children: ReactNode }) {
  return (
    <span className={pill({ tone })}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: GoalStatus }) {
  return <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>;
}

const CRIT: Record<CriterionStatus, [string, "success" | "info" | "muted"]> = {
  not_started: ["Not Started", "muted"],
  in_progress: ["In Progress", "info"],
  achieved: ["Achieved", "success"],
};
export function CriterionPill({ status }: { status: CriterionStatus }) {
  return <Pill tone={CRIT[status][1]}>{CRIT[status][0]}</Pill>;
}

export function ThinProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

export function LevelBlock({ label, level, emphasis }: { label: string; level: Level; emphasis?: boolean }) {
  return (
    <div className={cn("flex-1 rounded-lg border px-4 py-3", emphasis ? "border-primary/30 bg-primary-soft" : "bg-surface")}>
      <div className="eyebrow">{label}</div>
      <div className={cn("mt-1 text-lg font-semibold", emphasis && "text-primary")}>Level {level}</div>
      <div className="text-sm text-muted-foreground">{LEVELS[level]}</div>
    </div>
  );
}

export function LevelShift({ current, target, currentLabel = "Current", targetLabel = "Target" }: { current: Level; target: Level; currentLabel?: string; targetLabel?: string }) {
  return (
    <div className="flex items-stretch gap-3">
      <LevelBlock label={currentLabel} level={current} />
      <div className="flex items-center text-muted-foreground">→</div>
      <LevelBlock label={targetLabel} level={target} emphasis />
    </div>
  );
}

/** 5-segment level scale: filled = confirmed, outlined = target range. */
export function LevelScale({ current, target }: { current: number; target: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            n <= current ? "bg-primary" : n <= target ? "bg-primary/25" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="mt-1 text-sm font-medium">{children}</div>
    </div>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
