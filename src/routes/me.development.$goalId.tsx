import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDev } from "@/lib/dev/store";
import { can, fmtDate } from "@/lib/dev/logic";
import { ActionPlan, CheckinTimeline, EvidenceList, GoalSidebar, JourneySummary, SuccessCriteria } from "@/components/dev/goal-sections";
import { AddCheckinDialog, CloseGoalDialog, ConfirmLevelDialog } from "@/components/dev/dialogs";
import { LevelShift, StatusPill } from "@/components/dev/primitives";

export const Route = createFileRoute("/me/development/$goalId")({
  head: () => ({
    meta: [
      { title: "Development Goal — FORM Portal" },
      { name: "description", content: "Objective, action plan, check-ins and evidence for a development goal." },
      { property: "og:title", content: "Development Goal — FORM Portal" },
      { property: "og:description", content: "Objective, action plan, check-ins and evidence for a development goal." },
    ],
  }),
  component: GoalPage,
});

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="card-surface p-5">
      <div className="eyebrow">{label}</div>
      <p className="mt-2 text-[15px] leading-relaxed">{text}</p>
    </div>
  );
}

function GoalPage() {
  const { goalId } = Route.useParams();
  const { getGoal, role, requestCheckin } = useDev();
  const goal = getGoal(goalId);
  if (!goal) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">This development goal could not be found.</p>
        <Link to="/me/development" className="mt-4 inline-block text-sm font-semibold text-primary">← Back to My Development Plan</Link>
      </div>
    );
  }
  const done = goal.status === "completed";
  return (
    <div className="space-y-8">
      <div>
        <Link to="/me/development" className="text-sm text-muted-foreground hover:text-foreground">← My Development Plan</Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="eyebrow">{goal.category} · {goal.sourceType} · {fmtDate(goal.sourceDate)}</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{goal.title}</h1>
            <div className="mt-3"><StatusPill status={goal.status} /></div>
          </div>
          {!done && (
            <div className="flex flex-wrap gap-2">
              {role === "employee" && <Button size="sm" variant="outline" onClick={() => { requestCheckin(goal.id); toast.success("Check-in requested from your manager"); }}>Request check-in</Button>}
              {can.confirmLevel(role) && <ConfirmLevelDialog goal={goal} />}
              {can.closeGoal(role) && <CloseGoalDialog goal={goal} />}
            </div>
          )}
        </div>
      </div>

      {done && <JourneySummary goal={goal} />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="space-y-10">
          <div className="grid gap-4 md:grid-cols-2">
            <Block label="Development Objective" text={goal.objective} />
            <Block label="Why This Matters" text={goal.whyItMatters} />
            <Block label="Current State" text={goal.currentState} />
            <Block label="Target State" text={goal.targetState} />
          </div>
          <LevelShift current={goal.currentLevel} target={goal.targetLevel} />
          <ActionPlan goal={goal} />
          <SuccessCriteria goal={goal} />
          <CheckinTimeline goal={goal} action={!done && <AddCheckinDialog goalId={goal.id} />} />
          <EvidenceList goal={goal} />
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start"><GoalSidebar goal={goal} /></aside>
      </div>
    </div>
  );
}
