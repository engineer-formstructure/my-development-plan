import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDev } from "@/lib/dev/store";
import { isActive } from "@/lib/dev/logic";
import { CycleSummary, DevelopmentHistory, DevelopmentOverview, GoalCard, LearningCurve } from "@/components/dev/overview";
import { NewGoalDialog } from "@/components/dev/dialogs";
import { Section } from "@/components/dev/primitives";

export const Route = createFileRoute("/me/development/")({
  head: () => ({
    meta: [
      { title: "My Development Plan — FORM Portal" },
      { name: "description", content: "Your development journey, goals and progress at FORM." },
      { property: "og:title", content: "My Development Plan — FORM Portal" },
      { property: "og:description", content: "Your development journey, goals and progress at FORM." },
    ],
  }),
  component: DevelopmentPage,
});

function DevelopmentPage() {
  const { goals, employee } = useDev();
  const active = goals.filter(isActive);
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow">{employee.name} · {employee.position}</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">My Development Plan</h1>
          <p className="mt-2 text-muted-foreground">Your development journey, goals and progress.</p>
        </div>
        <NewGoalDialog />
      </div>
      <CycleSummary />
      <DevelopmentOverview />
      <Section title="Active Development Goals">
        {active.length === 0 ? (
          <div className="card-surface p-10 text-center">
            <div className="section-title">No active development goals</div>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Your next development goals can be created together during a Two-Way Meeting or career discussion.</p>
            <div className="mt-5"><NewGoalDialog trigger={<Button><Plus /> Create Development Goal</Button>} /></div>
          </div>
        ) : (
          <div className="grid gap-4">{active.map((g) => <GoalCard key={g.id} goal={g} />)}</div>
        )}
      </Section>
      <LearningCurve />
      <DevelopmentHistory />
    </div>
  );
}
