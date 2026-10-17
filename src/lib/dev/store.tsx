import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ASSESSMENTS, EMPLOYEES, GOALS } from "./data";
import type { Assessment, CheckIn, CriterionStatus, DevAction, DevGoal, Employee, Evidence, Level, Role } from "./types";

// In-memory prototype store. Historical records (check-ins, assessments, history)
// are append-only: there are intentionally no delete operations.

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

interface Store {
  employees: Employee[];
  employee: Employee;
  setEmployeeId: (id: string) => void;
  role: Role;
  setRole: (r: Role) => void;
  actorName: string;
  goals: DevGoal[]; // current employee
  assessments: Assessment[]; // current employee
  getGoal: (id: string) => DevGoal | undefined;
  addGoal: (g: Omit<DevGoal, "id" | "employeeId" | "managerId" | "history" | "checkins" | "evidence">) => string;
  addAction: (goalId: string, a: Omit<DevAction, "id">) => void;
  updateAction: (goalId: string, actionId: string, patch: Partial<DevAction>) => void;
  setCriterion: (goalId: string, id: string, status: CriterionStatus) => void;
  addCheckin: (goalId: string, c: Omit<CheckIn, "id" | "createdBy">) => void;
  addEvidence: (goalId: string, e: Omit<Evidence, "id" | "createdBy">) => void;
  confirmLevel: (goalId: string, level: Level, type: string, comment: string) => void;
  closeGoal: (goalId: string, outcome: DevGoal["finalOutcome"], comment: string, afterState: string) => void;
  requestCheckin: (goalId: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function DevStoreProvider({ children }: { children: ReactNode }) {
  const [employeeId, setEmployeeId] = useState("narin");
  const [role, setRole] = useState<Role>("employee");
  const [goals, setGoals] = useState<DevGoal[]>(GOALS);
  const [assessments, setAssessments] = useState<Assessment[]>(ASSESSMENTS);

  const employee = EMPLOYEES.find((e) => e.id === employeeId)!;
  const actorName = role === "employee" ? employee.name : employee.managerName;

  const store = useMemo<Store>(() => {
    const patchGoal = (id: string, fn: (g: DevGoal) => DevGoal, event?: string) =>
      setGoals((gs) =>
        gs.map((g) => {
          if (g.id !== id) return g;
          const next = fn(g);
          return event
            ? { ...next, history: [...next.history, { id: uid(), eventType: "update", detail: event, changedBy: actorName, createdAt: today() }] }
            : next;
        }),
      );
    return {
      employees: EMPLOYEES,
      employee,
      setEmployeeId,
      role,
      setRole,
      actorName,
      goals: goals.filter((g) => g.employeeId === employeeId),
      assessments: assessments.filter((a) => a.employeeId === employeeId),
      getGoal: (id) => goals.find((g) => g.id === id),
      addGoal: (g) => {
        const id = `${g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${uid().slice(0, 4)}`;
        setGoals((gs) => [
          {
            ...g,
            id,
            employeeId,
            managerId: employee.managerName,
            proposed: role === "employee",
            checkins: [{ id: uid(), date: g.startDate, type: g.sourceType, summary: role === "employee" ? "Goal proposed by employee." : "Development goal created.", createdBy: actorName }],
            evidence: [],
            history: [{ id: uid(), eventType: "created", detail: `Goal created (${g.sourceType})`, changedBy: actorName, createdAt: today() }],
          },
          ...gs,
        ]);
        return id;
      },
      addAction: (goalId, a) => patchGoal(goalId, (g) => ({ ...g, actions: [...g.actions, { ...a, id: uid() }] }), `Action added: ${a.title}`),
      updateAction: (goalId, actionId, patch) =>
        patchGoal(goalId, (g) => ({ ...g, actions: g.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)) }), "Action progress updated"),
      setCriterion: (goalId, id, status) =>
        patchGoal(goalId, (g) => ({ ...g, criteria: g.criteria.map((c) => (c.id === id ? { ...c, status } : c)) }), "Success criterion updated"),
      addCheckin: (goalId, c) =>
        patchGoal(goalId, (g) => ({ ...g, checkins: [...g.checkins, { ...c, id: uid(), createdBy: actorName }].sort((a, b) => a.date.localeCompare(b.date)) }), `Check-in added: ${c.type}`),
      addEvidence: (goalId, e) => patchGoal(goalId, (g) => ({ ...g, evidence: [...g.evidence, { ...e, id: uid(), createdBy: actorName }] }), `Evidence added: ${e.title}`),
      confirmLevel: (goalId, level, type, comment) => {
        const g = goals.find((x) => x.id === goalId);
        if (!g) return;
        setAssessments((as) => [...as, { id: uid(), employeeId: g.employeeId, competency: g.title, goalId, level, date: today(), type, confirmedBy: actorName, comment }]);
        patchGoal(goalId, (x) => ({ ...x, currentLevel: level }), `Competency level confirmed: Level ${level}`);
      },
      closeGoal: (goalId, outcome, comment, afterState) =>
        patchGoal(goalId, (g) => ({ ...g, status: "completed", completedAt: today(), finalOutcome: outcome, finalComment: comment, afterState, milestones: g.milestones ?? g.actions.filter((a) => a.done).map((a) => a.title) }), "Goal closed"),
      requestCheckin: (goalId) =>
        patchGoal(goalId, (g) => ({ ...g, checkins: [...g.checkins, { id: uid(), date: today(), type: "Development Check-in", summary: "Check-in requested by employee.", createdBy: actorName, upcoming: true }] }), "Check-in requested"),
    };
  }, [goals, assessments, employeeId, role, employee, actorName]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useDev() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useDev outside DevStoreProvider");
  return s;
}
