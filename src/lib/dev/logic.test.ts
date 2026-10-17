import { describe, expect, it } from "vitest";
import { actionProgress, can, overallStatus } from "./logic";
import { GOALS } from "./data";

describe("development plan rules", () => {
  it("action progress averages actions, counting partial counts", () => {
    const p = actionProgress({
      actions: [
        { id: "a", title: "", type: "Practice", owner: "", done: true },
        { id: "b", title: "", type: "Exposure", owner: "", done: false, progressCurrent: 1, progressTotal: 2 },
      ],
    });
    expect(p).toBe(75);
  });

  it("only managers can confirm competency levels", () => {
    expect(can.confirmLevel("employee")).toBe(false);
    expect(can.confirmLevel("manager")).toBe(true);
  });

  it("review due outranks on track in overall status", () => {
    const g = GOALS.filter((x) => x.employeeId === "narin");
    expect(overallStatus(g)).toBe("review_due");
  });
});
