import type { DevAction, DevGoal, GoalStatus, Role } from "./types";

/** Fraction (0–1) of one action. Completed = 1, counted actions = current/total. */
export function actionFraction(a: DevAction): number {
  if (a.done) return 1;
  if (a.progressTotal && a.progressTotal > 0) {
    return Math.min(1, (a.progressCurrent ?? 0) / a.progressTotal);
  }
  return 0;
}

/** Action progress only — never implies a competency level change. */
export function actionProgress(goal: Pick<DevGoal, "actions">): number {
  if (goal.actions.length === 0) return 0;
  const sum = goal.actions.reduce((s, a) => s + actionFraction(a), 0);
  return Math.round((sum / goal.actions.length) * 100);
}

export const STATUS_LABEL: Record<GoalStatus, string> = {
  on_track: "On Track",
  needs_attention: "Needs Attention",
  review_due: "Review Due",
  completed: "Completed",
  paused: "Paused",
};

export function isActive(g: DevGoal) {
  return g.status !== "completed" && g.status !== "paused";
}

/** Overall cycle status: the most urgent active status wins. */
export function overallStatus(goals: DevGoal[]): GoalStatus {
  const active = goals.filter(isActive);
  if (active.length === 0) return "completed";
  if (active.some((g) => g.status === "review_due")) return "review_due";
  if (active.some((g) => g.status === "needs_attention")) return "needs_attention";
  return "on_track";
}

export const can = {
  confirmLevel: (r: Role) => r === "manager",
  closeGoal: (r: Role) => r === "manager",
  managerFeedback: (r: Role) => r === "manager",
  editGoal: (r: Role) => r === "manager",
  addEvidence: (_r: Role) => true,
  updateActionProgress: (_r: Role) => true,
};

export function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function fmtMonth(iso?: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
