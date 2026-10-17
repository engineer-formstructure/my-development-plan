// Shapes mirror the planned relational model (development_goals, development_actions, ...)
// so the in-memory prototype can later be swapped for Lovable Cloud tables.

export type Level = 1 | 2 | 3 | 4 | 5;

export const LEVELS: Record<Level, string> = {
  1: "Awareness",
  2: "Developing",
  3: "Independent",
  4: "Advanced",
  5: "Leadership / Expert",
};

export type GoalStatus = "on_track" | "needs_attention" | "review_due" | "completed" | "paused";

export const SOURCE_TYPES = [
  "Two-Way Meeting",
  "Mid-Year Review",
  "Year-End Review",
  "Project Feedback",
  "Career Discussion",
  "Employee Initiative",
  "Manager Recommendation",
  "Other",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const ACTION_TYPES = [
  "Learning",
  "Practice",
  "Project Assignment",
  "Exposure",
  "Mentoring",
  "Coaching",
  "Feedback",
  "Course / Training",
  "Self Study",
  "Other",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const EVIDENCE_TYPES = [
  "Project",
  "Meeting",
  "Presentation",
  "Training",
  "Certificate",
  "Document",
  "Manager Feedback",
  "Client Feedback",
  "Self Reflection",
  "Other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const CHECKIN_TYPES = [
  "Two-Way Meeting",
  "Project Check-in",
  "Development Check-in",
  "Mid-Year Review",
  "Year-End Review",
  "Scheduled Review",
] as const;

export type CriterionStatus = "not_started" | "in_progress" | "achieved";

export interface DevAction {
  id: string;
  title: string;
  type: ActionType;
  owner: string;
  target?: string;
  frequency?: string;
  progressCurrent?: number;
  progressTotal?: number;
  due?: string;
  done: boolean;
}

export interface Criterion {
  id: string;
  criterion: string;
  status: CriterionStatus;
}

export interface CheckIn {
  id: string;
  date: string;
  type: string;
  summary?: string;
  agreedFocus?: string;
  observation?: string;
  employeeReflection?: string;
  managerFeedback?: string;
  agreedNextStep?: string;
  relatedProject?: string;
  createdBy: string;
  upcoming?: boolean;
}

export interface Evidence {
  id: string;
  checkinId?: string;
  type: EvidenceType;
  title: string;
  date: string;
  role?: string;
  description?: string;
  project?: string;
  attachmentName?: string;
  createdBy: string;
}

export interface HistoryEvent {
  id: string;
  eventType: string;
  detail: string;
  changedBy: string;
  createdAt: string;
}

export interface DevGoal {
  id: string;
  employeeId: string;
  managerId: string;
  title: string;
  category: string;
  sourceType: SourceType;
  sourceDate: string;
  sourceId?: string; // future link to a Two-Way Meeting / review record
  objective: string;
  whyItMatters: string;
  currentState: string;
  targetState: string;
  startLevel: Level;
  currentLevel: Level; // only changed by a confirmed assessment
  targetLevel: Level;
  careerCompetency?: { role: string; competency: string };
  status: GoalStatus;
  proposed?: boolean;
  startDate: string;
  targetDate: string;
  nextReviewDate?: string;
  completedAt?: string;
  reviewFrequency?: string;
  evidenceRequired?: string;
  milestones?: string[];
  finalOutcome?: "Achieved" | "Partially achieved" | "Closed";
  finalComment?: string;
  afterState?: string;
  actions: DevAction[];
  criteria: Criterion[];
  checkins: CheckIn[];
  evidence: Evidence[];
  history: HistoryEvent[];
}

export interface Assessment {
  id: string;
  employeeId: string;
  competency: string;
  goalId?: string;
  level: Level;
  date: string;
  type: string;
  confirmedBy: string;
  comment?: string;
  reflection?: string;
  evidence?: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  managerName: string;
  cycle: { label: string; start: string; end: string };
  lastReview: { type: string; date: string };
  competencies: { name: string; current: Level; target: Level }[];
  careerTarget?: {
    from: string;
    to: string;
    requirements: { name: string; status: "achieved" | "active" | "not_started" }[];
  };
}

export type Role = "employee" | "manager";
