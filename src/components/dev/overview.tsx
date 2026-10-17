import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDev } from "@/lib/dev/store";
import { actionProgress, fmtDate, fmtMonth, isActive, overallStatus } from "@/lib/dev/logic";
import { LEVELS, type Assessment, type DevGoal, type Level } from "@/lib/dev/types";
import { cn } from "@/lib/utils";
import { Field, LevelScale, Section, StatusPill, ThinProgress } from "./primitives";
import { GoalPlanBody } from "./goal-sections";

export function CycleSummary() {
  const { employee, goals } = useDev();
  const active = goals.filter(isActive);
  const completed = goals.filter((g) => g.status === "completed" && g.completedAt && g.completedAt >= employee.cycle.start);
  const next = active.map((g) => g.nextReviewDate).filter(Boolean).sort()[0];
  const items = [
    { k: "Development Cycle", v: employee.cycle.label },
    { k: "Last Review", v: employee.lastReview.type, s: fmtDate(employee.lastReview.date) },
    { k: "Next Check-in", v: fmtDate(next) },
    { k: "Active Goals", v: String(active.length) },
    { k: "Completed Goals", v: String(completed.length) },
  ];
  return (
    <div className="card-surface p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="eyebrow">Cycle summary</div>
        <StatusPill status={overallStatus(goals)} />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-5">
        {items.map((i) => (
          <div key={i.k} className="min-w-0">
            <div className="eyebrow">{i.k}</div>
            <div className="mt-1.5 truncate text-lg font-semibold">{i.v}</div>
            {i.s && <div className="text-sm text-muted-foreground">{i.s}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DevelopmentOverview() {
  const { employee } = useDev();
  return (
    <Section title="Development Overview">
      <div className="card-surface divide-y">
        {employee.competencies.map((c) => (
          <div key={c.name} className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1fr_2fr_auto] md:items-center md:gap-6">
            <div className="text-sm font-semibold">{c.name}</div>
            <LevelScale current={c.current} target={c.target} />
            <div className="font-mono text-xs text-muted-foreground">
              Level {c.current} <span className="text-primary">→ Level {c.target}</span>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3 font-mono text-[11px] text-muted-foreground">
          {(Object.keys(LEVELS) as unknown as Level[]).map((l) => (
            <span key={l}>L{l} {LEVELS[l]}</span>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function GoalCard({ goal }: { goal: DevGoal }) {
  const [open, setOpen] = useState(false);
  const p = actionProgress(goal);
  return (
    <div className="card-surface overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full p-5 text-left md:p-6" aria-expanded={open}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">{goal.title}</h3>
              {goal.proposed && <span className="eyebrow">Proposed</span>}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {goal.category} · {goal.sourceType} · {fmtDate(goal.sourceDate)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={goal.status} />
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Field label="Current Level">Level {goal.currentLevel} — {LEVELS[goal.currentLevel]}</Field>
          <Field label="Target Level"><span className="text-primary">Level {goal.targetLevel} — {LEVELS[goal.targetLevel]}</span></Field>
          <div>
            <div className="eyebrow">Action Progress</div>
            <div className="mt-1 text-sm font-medium">{p}%</div>
            <ThinProgress value={p} className="mt-2" />
          </div>
          <Field label="Next Review">{fmtDate(goal.nextReviewDate)}</Field>
        </div>
      </button>
      <div className={cn("grid transition-all duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="border-t bg-background/50 p-5 md:p-6">
            <GoalPlanBody goal={goal} compact />
            <Link to="/me/development/$goalId" params={{ goalId: goal.id }} className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
              Open full development plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LearningCurve() {
  const { assessments } = useDev();
  const competencies = Array.from(new Set(assessments.map((a) => a.competency)));
  const [sel, setSel] = useState<string>("");
  const comp = competencies.includes(sel) ? sel : competencies[0];
  const points = assessments.filter((a) => a.competency === comp).sort((a, b) => a.date.localeCompare(b.date));
  const [picked, setPicked] = useState<Assessment | null>(null);
  const active = picked && picked.competency === comp ? picked : points[points.length - 1];

  return (
    <Section
      title="My Learning Curve"
      action={
        competencies.length > 0 && (
          <select aria-label="Competency" className="field-select w-auto" value={comp} onChange={(e) => { setSel(e.target.value); setPicked(null); }}>
            {competencies.map((c) => <option key={c}>{c}</option>)}
          </select>
        )
      }
    >
      {points.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted-foreground">
          Your learning curve will appear after competency assessments have been recorded.
        </div>
      ) : (
        <div className="card-surface grid gap-0 md:grid-cols-[1fr_300px]">
          <div className="h-72 p-4 md:h-80 md:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points.map((p) => ({ ...p, label: fmtMonth(p.date) }))} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => `L${v}`} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ stroke: "var(--color-border)" }} formatter={(v) => [`Level ${v}`, "Confirmed"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  isAnimationActive
                  dot={(props: { cx?: number; cy?: number; index?: number }) => {
                    const pt = points[props.index ?? 0];
                    const on = active?.id === pt.id;
                    return (
                      <circle key={pt.id} cx={props.cx} cy={props.cy} r={on ? 7 : 5} fill={on ? "var(--color-primary)" : "var(--color-surface)"} stroke="var(--color-primary)" strokeWidth={2} style={{ cursor: "pointer" }} onClick={() => setPicked(pt)} />
                    );
                  }}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {active && (
            <div className="space-y-4 border-t p-5 md:border-l md:border-t-0">
              <div className="eyebrow">Assessment point</div>
              <div>
                <div className="text-2xl font-bold">Level {active.level}</div>
                <div className="text-sm text-muted-foreground">{LEVELS[active.level]}</div>
              </div>
              <Field label="Date">{fmtDate(active.date)}</Field>
              <Field label="Review Type">{active.type} · {active.confirmedBy}</Field>
              {active.evidence && <Field label="Evidence">{active.evidence}</Field>}
              {active.reflection && <Field label="Employee Reflection"><span className="italic">“{active.reflection}”</span></Field>}
              {active.comment && <Field label="Manager Comment"><span className="italic">“{active.comment}”</span></Field>}
              <p className="text-xs text-muted-foreground">Levels change only when confirmed in a review — not from completed tasks.</p>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

const FILTERS = ["All", "Active", "Completed", "Paused"] as const;
export function DevelopmentHistory() {
  const { goals } = useDev();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Completed");
  const list = goals.filter((g) => (f === "All" ? true : f === "Active" ? isActive(g) : f === "Completed" ? g.status === "completed" : g.status === "paused"));
  return (
    <Section
      title="Development History"
      action={
        <div className="flex rounded-md border p-0.5 text-xs">
          {FILTERS.map((x) => (
            <button key={x} onClick={() => setF(x)} className={cn("rounded px-2.5 py-1 transition-colors", f === x ? "bg-secondary font-semibold" : "text-muted-foreground hover:text-foreground")}>{x}</button>
          ))}
        </div>
      }
    >
      <div className="card-surface divide-y">
        {list.length === 0 && <div className="p-6 text-sm text-muted-foreground">No goals in this view.</div>}
        {list.map((g) => (
          <Link key={g.id} to="/me/development/$goalId" params={{ goalId: g.id }} className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-accent/50 md:flex-row md:items-center md:gap-6">
            <div className="flex-1 font-semibold">{g.title}</div>
            <div className="font-mono text-xs text-muted-foreground">{fmtMonth(g.startDate)} – {fmtMonth(g.completedAt ?? g.targetDate)}</div>
            <div className="font-mono text-xs">Level {g.startLevel} → Level {g.currentLevel}</div>
            <div className="md:w-36 md:text-right">{g.status === "completed" ? <span className="eyebrow text-success">{g.finalOutcome ?? "Achieved"}</span> : <StatusPill status={g.status} />}</div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
