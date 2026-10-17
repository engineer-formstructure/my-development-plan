import { Check, Paperclip } from "lucide-react";
import { useDev } from "@/lib/dev/store";
import { actionFraction, actionProgress, can, fmtDate } from "@/lib/dev/logic";
import { LEVELS, type CriterionStatus, type DevGoal } from "@/lib/dev/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CriterionPill, Field, LevelShift, Section, StatusPill, ThinProgress } from "./primitives";
import { AddActionDialog, AddEvidenceDialog } from "./dialogs";

function TextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <p className="mt-1.5 text-[15px] leading-relaxed">{text}</p>
    </div>
  );
}

export function GoalPlanBody({ goal, compact }: { goal: DevGoal; compact?: boolean }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <TextBlock label="Development Objective" text={goal.objective} />
        <TextBlock label="Why This Matters" text={goal.whyItMatters} />
        <TextBlock label="Current State" text={goal.currentState} />
        <TextBlock label="Target State" text={goal.targetState} />
      </div>
      <LevelShift current={goal.currentLevel} target={goal.targetLevel} />
      <ActionPlan goal={goal} readOnly={compact} />
      <SuccessCriteria goal={goal} readOnly={compact} />
    </div>
  );
}

export function ActionPlan({ goal, readOnly }: { goal: DevGoal; readOnly?: boolean | undefined }) {
  const { updateAction, role } = useDev();
  const locked = goal.status === "completed";
  return (
    <Section title="Development Action Plan" action={!readOnly && !locked && <AddActionDialog goalId={goal.id} />}>
      <div className="grid gap-3">
        {goal.actions.map((a, i) => (
          <div key={a.id} className="rounded-lg border bg-surface p-4">
            <div className="flex items-start gap-3">
              <div className="font-mono text-xs text-muted-foreground">ACTION {String(i + 1).padStart(2, "0")}</div>
              {a.done && <Check className="ml-auto size-4 text-success" />}
            </div>
            <div className={cn("mt-1.5 font-medium", a.done && "text-muted-foreground")}>{a.title}</div>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
              <Field label="Type">{a.type}</Field>
              <Field label="Owner">{a.owner}</Field>
              {a.target && <Field label="Target">{a.target}</Field>}
              {a.frequency && <Field label="Frequency">{a.frequency}</Field>}
              <Field label="Progress">
                {a.done ? "Completed" : a.progressTotal ? `${a.progressCurrent ?? 0} / ${a.progressTotal}` : "Ongoing"}
              </Field>
              {a.due && <Field label="Due">{fmtDate(a.due)}</Field>}
            </div>
            {a.progressTotal && !a.done ? <ThinProgress value={actionFraction(a) * 100} className="mt-3" /> : null}
            {!readOnly && !locked && can.updateActionProgress(role) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {a.progressTotal && !a.done ? (
                  <Button size="sm" variant="outline" onClick={() => {
                    const n = Math.min(a.progressTotal!, (a.progressCurrent ?? 0) + 1);
                    updateAction(goal.id, a.id, { progressCurrent: n, done: n >= a.progressTotal! });
                  }}>+1 progress</Button>
                ) : null}
                <Button size="sm" variant={a.done ? "ghost" : "outline"} onClick={() => updateAction(goal.id, a.id, { done: !a.done })}>
                  {a.done ? "Reopen" : "Mark complete"}
                </Button>
              </div>
            )}
          </div>
        ))}
        {goal.actions.length === 0 && <p className="text-sm text-muted-foreground">No actions yet.</p>}
      </div>
    </Section>
  );
}

const NEXT: Record<CriterionStatus, CriterionStatus> = { not_started: "in_progress", in_progress: "achieved", achieved: "not_started" };

export function SuccessCriteria({ goal, readOnly }: { goal: DevGoal; readOnly?: boolean | undefined }) {
  const { setCriterion, role } = useDev();
  const editable = !readOnly && role === "manager" && goal.status !== "completed";
  return (
    <Section title="How we will know this has improved">
      <ol className="divide-y rounded-lg border bg-surface">
        {goal.criteria.map((c, i) => (
          <li key={c.id} className="flex items-start gap-4 p-4">
            <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 text-sm">{c.criterion}</span>
            {editable ? (
              <button onClick={() => setCriterion(goal.id, c.id, NEXT[c.status])} title="Change status"><CriterionPill status={c.status} /></button>
            ) : (
              <CriterionPill status={c.status} />
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function CheckinTimeline({ goal, action }: { goal: DevGoal; action?: React.ReactNode }) {
  return (
    <Section title="Development Check-ins" action={action}>
      <ol className="relative ml-1.5 space-y-6 border-l pl-6">
        {goal.checkins.map((c) => (
          <li key={c.id} className="relative">
            <span className={cn("absolute -left-[31px] top-1 size-3 rounded-full border-2", c.upcoming ? "border-primary bg-surface" : "border-primary bg-primary")} />
            <div className="font-mono text-xs text-muted-foreground">{fmtDate(c.date).toUpperCase()}</div>
            <div className="mt-0.5 font-semibold">{c.type}{c.upcoming && <span className="eyebrow ml-2 text-primary">Upcoming</span>}</div>
            {c.summary && <p className="mt-1 text-sm">{c.summary}</p>}
            <div className="mt-2 space-y-2 text-sm">
              {c.agreedFocus && <p><span className="text-muted-foreground">Agreed focus: </span>{c.agreedFocus}</p>}
              {c.observation && <p><span className="text-muted-foreground">Observation: </span>{c.observation}</p>}
              {c.employeeReflection && <p><span className="text-muted-foreground">Employee reflection: </span><span className="italic">“{c.employeeReflection}”</span></p>}
              {c.managerFeedback && <p><span className="text-muted-foreground">Manager feedback: </span><span className="italic">“{c.managerFeedback}”</span></p>}
              {c.agreedNextStep && <p><span className="text-muted-foreground">Next step: </span>{c.agreedNextStep}</p>}
              {c.relatedProject && <p className="text-muted-foreground">Project · {c.relatedProject}</p>}
              <p className="text-xs text-muted-foreground">By {c.createdBy}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function EvidenceList({ goal }: { goal: DevGoal }) {
  return (
    <Section title="Evidence of Development" action={goal.status !== "completed" && <AddEvidenceDialog goalId={goal.id} />}>
      {goal.evidence.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No evidence recorded yet. Meetings, presentations, feedback and certificates all count.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {goal.evidence.map((e) => (
            <div key={e.id} className="rounded-lg border bg-surface p-4">
              <div className="eyebrow">{e.type} · {fmtDate(e.date)}</div>
              <div className="mt-1 font-semibold">{e.title}</div>
              {e.role && <p className="mt-2 text-sm"><span className="text-muted-foreground">Role: </span>{e.role}</p>}
              {e.description && <p className="mt-1 text-sm"><span className="text-muted-foreground">Observation: </span>{e.description}</p>}
              {e.attachmentName && <p className="mt-2 flex items-center gap-1.5 text-sm text-primary"><Paperclip className="size-3.5" />{e.attachmentName}</p>}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export function JourneySummary({ goal }: { goal: DevGoal }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b bg-primary-soft px-6 py-4">
        <div className="eyebrow text-primary">Development Journey</div>
        <div className="mt-1 text-xl font-bold">{goal.title}</div>
      </div>
      <div className="grid gap-8 p-6 md:grid-cols-2">
        <div className="space-y-6">
          <LevelShift current={goal.startLevel} target={goal.currentLevel} currentLabel={`Start · ${fmtDate(goal.startDate)}`} targetLabel={`Confirmed · ${fmtDate(goal.completedAt)}`} />
          <div>
            <div className="eyebrow">Key Milestones</div>
            <ul className="mt-2 space-y-1.5">
              {(goal.milestones ?? []).map((m) => (
                <li key={m} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-success" />{m}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <div className="eyebrow">What changed</div>
            <p className="mt-1.5 text-sm"><span className="text-muted-foreground">Before: </span>{goal.currentState}</p>
            <p className="mt-1.5 text-sm"><span className="text-muted-foreground">After: </span>{goal.afterState ?? goal.targetState}</p>
          </div>
          <Field label="Final Outcome"><span className="text-success">{goal.finalOutcome?.toUpperCase()}</span></Field>
          {goal.finalComment && <Field label="Manager Comment"><span className="italic">“{goal.finalComment}”</span></Field>}
        </div>
      </div>
    </div>
  );
}

export function GoalSidebar({ goal }: { goal: DevGoal }) {
  const { employee } = useDev();
  const p = actionProgress(goal);
  return (
    <div className="space-y-4">
      <div className="card-surface space-y-5 p-5">
        <div className="flex items-center justify-between"><span className="eyebrow">Status</span><StatusPill status={goal.status} /></div>
        <div>
          <div className="flex justify-between"><span className="eyebrow">Action progress</span><span className="text-sm font-semibold">{p}%</span></div>
          <ThinProgress value={p} className="mt-2" />
          <p className="mt-2 text-xs text-muted-foreground">Tracks actions completed — separate from competency level.</p>
        </div>
        <Field label="Confirmed Level">Level {goal.currentLevel} — {LEVELS[goal.currentLevel]}</Field>
        <Field label="Start Date">{fmtDate(goal.startDate)}</Field>
        <Field label="Target Date">{fmtDate(goal.targetDate)}</Field>
        <Field label="Next Check-in">{fmtDate(goal.nextReviewDate)}</Field>
        <Field label="Manager">{employee.managerName}</Field>
        <Field label="Source">{goal.sourceType} · {fmtDate(goal.sourceDate)}</Field>
        {goal.reviewFrequency && <Field label="Review Frequency">{goal.reviewFrequency}</Field>}
      </div>
      {goal.careerCompetency && (
        <div className="card-surface p-5">
          <div className="eyebrow">Related Career Competency</div>
          <div className="mt-2 font-semibold">{goal.careerCompetency.role}</div>
          <div className="text-sm text-primary">→ {goal.careerCompetency.competency}</div>
        </div>
      )}
      {employee.careerTarget && (
        <div className="card-surface p-5">
          <div className="eyebrow">Career Target</div>
          <div className="mt-2 text-sm font-semibold">{employee.careerTarget.from} → {employee.careerTarget.to}</div>
          <ul className="mt-3 space-y-2">
            {employee.careerTarget.requirements.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-2 text-sm">
                <span>{r.name}</span>
                <span className={cn("font-mono text-[10px] uppercase tracking-wider", r.status === "achieved" ? "text-success" : r.status === "active" ? "text-primary" : "text-muted-foreground")}>
                  {r.status === "achieved" ? "Achieved" : r.status === "active" ? "Active plan" : "Not started"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
