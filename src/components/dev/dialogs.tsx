import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDev } from "@/lib/dev/store";
import { can } from "@/lib/dev/logic";
import { ACTION_TYPES, CHECKIN_TYPES, EVIDENCE_TYPES, LEVELS, SOURCE_TYPES, type ActionType, type DevAction, type DevGoal, type Level } from "@/lib/dev/types";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);

function F({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select className="field-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function LevelSel({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <select className="field-select" value={value} onChange={(e) => onChange(Number(e.target.value) as Level)}>
      {([1, 2, 3, 4, 5] as Level[]).map((l) => <option key={l} value={l}>Level {l} — {LEVELS[l]}</option>)}
    </select>
  );
}

export function AddActionDialog({ goalId }: { goalId: string }) {
  const { addAction, actorName } = useDev();
  const [open, setOpen] = useState(false);
  const [a, setA] = useState({ title: "", type: "Practice" as ActionType, owner: actorName, target: "", due: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus /> Add Action</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add development action</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <F label="Action"><Input value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} placeholder="e.g. Lead the next coordination meeting" /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Type"><Sel value={a.type} onChange={(v) => setA({ ...a, type: v as ActionType })} options={ACTION_TYPES} /></F>
            <F label="Owner"><Input value={a.owner} onChange={(e) => setA({ ...a, owner: e.target.value })} /></F>
            <F label="Target"><Input value={a.target} onChange={(e) => setA({ ...a, target: e.target.value })} /></F>
            <F label="Due"><Input type="date" value={a.due} onChange={(e) => setA({ ...a, due: e.target.value })} /></F>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!a.title.trim()} onClick={() => { addAction(goalId, { ...a, target: a.target || undefined, due: a.due || undefined, done: false }); setOpen(false); setA({ ...a, title: "", target: "" }); toast.success("Action added"); }}>Add action</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddEvidenceDialog({ goalId }: { goalId: string }) {
  const { addEvidence } = useDev();
  const [open, setOpen] = useState(false);
  const blank = { type: "Meeting" as (typeof EVIDENCE_TYPES)[number], title: "", date: today(), role: "", description: "", project: "", attachmentName: "" };
  const [e, setE] = useState(blank);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus /> Add Evidence</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add evidence</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Type"><Sel value={e.type} onChange={(v) => setE({ ...e, type: v as typeof e.type })} options={EVIDENCE_TYPES} /></F>
            <F label="Date"><Input type="date" value={e.date} onChange={(x) => setE({ ...e, date: x.target.value })} /></F>
          </div>
          <F label="Title"><Input value={e.title} onChange={(x) => setE({ ...e, title: x.target.value })} placeholder="e.g. KENT Design Review Meeting" /></F>
          <F label="Your role"><Input value={e.role} onChange={(x) => setE({ ...e, role: x.target.value })} /></F>
          <F label="Description / observation"><Textarea value={e.description} onChange={(x) => setE({ ...e, description: x.target.value })} /></F>
          <F label="Attachment (optional)"><Input type="file" onChange={(x) => setE({ ...e, attachmentName: x.target.files?.[0]?.name ?? "" })} /></F>
        </div>
        <DialogFooter>
          <Button disabled={!e.title.trim()} onClick={() => {
            addEvidence(goalId, { ...e, role: e.role || undefined, description: e.description || undefined, project: e.project || undefined, attachmentName: e.attachmentName || undefined });
            setOpen(false); setE(blank); toast.success("Evidence added");
          }}>Save evidence</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddCheckinDialog({ goalId }: { goalId: string }) {
  const { addCheckin, role } = useDev();
  const [open, setOpen] = useState(false);
  const blank = { date: today(), type: "Development Check-in", summary: "", observation: "", employeeReflection: "", managerFeedback: "", agreedNextStep: "", relatedProject: "" };
  const [c, setC] = useState(blank);
  const mgr = can.managerFeedback(role);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus /> {mgr ? "Add Check-in" : "Add Reflection"}</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{mgr ? "Record check-in" : "Add self reflection"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Date"><Input type="date" value={c.date} onChange={(e) => setC({ ...c, date: e.target.value })} /></F>
            <F label="Type"><Sel value={c.type} onChange={(v) => setC({ ...c, type: v })} options={CHECKIN_TYPES} /></F>
          </div>
          <F label="What happened"><Input value={c.summary} onChange={(e) => setC({ ...c, summary: e.target.value })} /></F>
          <F label="Employee reflection"><Textarea value={c.employeeReflection} onChange={(e) => setC({ ...c, employeeReflection: e.target.value })} /></F>
          {mgr && (
            <>
              <F label="Observation"><Textarea value={c.observation} onChange={(e) => setC({ ...c, observation: e.target.value })} /></F>
              <F label="Manager feedback"><Textarea value={c.managerFeedback} onChange={(e) => setC({ ...c, managerFeedback: e.target.value })} /></F>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <F label="Agreed next step"><Input value={c.agreedNextStep} onChange={(e) => setC({ ...c, agreedNextStep: e.target.value })} /></F>
            <F label="Related project"><Input value={c.relatedProject} onChange={(e) => setC({ ...c, relatedProject: e.target.value })} /></F>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!c.summary.trim() && !c.employeeReflection.trim()} onClick={() => {
            const clean = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v || undefined])) as typeof c;
            addCheckin(goalId, { ...clean, date: c.date, type: c.type, upcoming: c.date > today() });
            setOpen(false); setC(blank); toast.success("Check-in recorded");
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmLevelDialog({ goal }: { goal: DevGoal }) {
  const { confirmLevel } = useDev();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<Level>(goal.currentLevel);
  const [type, setType] = useState("Manager Assessment");
  const [comment, setComment] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Confirm level</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Confirm competency level</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">This records a new assessment point. Previous assessments are kept unchanged.</p>
        <div className="grid gap-4">
          <F label="Confirmed level"><LevelSel value={level} onChange={setLevel} /></F>
          <F label="Assessment type"><Sel value={type} onChange={setType} options={["Manager Assessment", "Two-Way Meeting", "Mid-Year Review", "Year-End Review"]} /></F>
          <F label="Comment"><Textarea value={comment} onChange={(e) => setComment(e.target.value)} /></F>
        </div>
        <DialogFooter><Button onClick={() => { confirmLevel(goal.id, level, type, comment); setOpen(false); toast.success(`Level ${level} confirmed`); }}>Confirm</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CloseGoalDialog({ goal }: { goal: DevGoal }) {
  const { closeGoal } = useDev();
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<NonNullable<DevGoal["finalOutcome"]>>("Achieved");
  const [after, setAfter] = useState("");
  const [comment, setComment] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Close goal</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Final assessment</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <F label="Outcome"><Sel value={outcome} onChange={(v) => setOutcome(v as typeof outcome)} options={["Achieved", "Partially achieved", "Closed"]} /></F>
          <F label="What changed — after"><Textarea value={after} onChange={(e) => setAfter(e.target.value)} placeholder="Describe what the employee can now do" /></F>
          <F label="Manager comment"><Textarea value={comment} onChange={(e) => setComment(e.target.value)} /></F>
        </div>
        <DialogFooter><Button onClick={() => { closeGoal(goal.id, outcome, comment, after); setOpen(false); toast.success("Goal closed — journey summary created"); }}>Close goal</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STEPS = ["Development Area", "Define Development", "Action Plan", "Measurement", "Timeline", "Confirmation"];

export function NewGoalDialog({ trigger }: { trigger?: ReactNode }) {
  const { addGoal, role, employee } = useDev();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const init = () => ({
    title: "", category: employee.competencies[0]?.name ?? "Communication", career: "", sourceType: "Two-Way Meeting" as (typeof SOURCE_TYPES)[number], sourceDate: today(),
    objective: "", whyItMatters: "", currentState: "", targetState: "", currentLevel: 2 as Level, targetLevel: 3 as Level,
    actions: [] as Omit<DevAction, "id">[], criteria: [""], evidenceRequired: "", reviewFrequency: "Monthly",
    startDate: today(), targetDate: "", nextReviewDate: "", agreedOn: today(),
  });
  const [d, setD] = useState(init);
  const [act, setAct] = useState({ title: "", type: "Practice" as ActionType, owner: employee.name, target: "", due: "" });
  const set = (p: Partial<typeof d>) => setD({ ...d, ...p });
  const valid = [d.title.trim() !== "", d.objective.trim() !== "", true, d.criteria.some((c) => c.trim()), d.targetDate !== "", true][step];

  const save = () => {
    const id = addGoal({
      title: d.title, category: d.category, sourceType: d.sourceType, sourceDate: d.sourceDate,
      objective: d.objective, whyItMatters: d.whyItMatters, currentState: d.currentState, targetState: d.targetState,
      startLevel: d.currentLevel, currentLevel: d.currentLevel, targetLevel: d.targetLevel,
      careerCompetency: d.career && employee.careerTarget ? { role: employee.careerTarget.to, competency: d.career } : undefined,
      status: "on_track", startDate: d.startDate, targetDate: d.targetDate, nextReviewDate: d.nextReviewDate || undefined,
      reviewFrequency: d.reviewFrequency, evidenceRequired: d.evidenceRequired,
      actions: d.actions.map((a, i) => ({ ...a, id: `n${i}` })),
      criteria: d.criteria.filter((c) => c.trim()).map((c, i) => ({ id: `c${i}`, criterion: c, status: "not_started" })),
    });
    setOpen(false); setStep(0); setD(init());
    toast.success(role === "employee" ? "Goal proposed to your manager" : "Development plan saved");
    navigate({ to: "/me/development/$goalId", params: { goalId: id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button><Plus /> {role === "employee" ? "Propose Goal" : "New Development Goal"}</Button>}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="eyebrow">Step {step + 1} of {STEPS.length}</div>
          <DialogTitle>{STEPS[step]}</DialogTitle>
          <div className="flex gap-1 pt-2">{STEPS.map((_, i) => <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />)}</div>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {step === 0 && (<>
            <F label="Goal title"><Input value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Client Communication" /></F>
            <F label="Competency category"><Sel value={d.category} onChange={(v) => set({ category: v })} options={employee.competencies.map((c) => c.name)} /></F>
            {employee.careerTarget && <F label="Related career competency (optional)"><Sel value={d.career} onChange={(v) => set({ career: v })} options={["", ...employee.careerTarget.requirements.map((r) => r.name)]} /></F>}
            <div className="grid grid-cols-2 gap-3">
              <F label="Source"><Sel value={d.sourceType} onChange={(v) => set({ sourceType: v as typeof d.sourceType })} options={SOURCE_TYPES} /></F>
              <F label="Source date"><Input type="date" value={d.sourceDate} onChange={(e) => set({ sourceDate: e.target.value })} /></F>
            </div>
          </>)}
          {step === 1 && (<>
            <F label="Development objective"><Textarea value={d.objective} onChange={(e) => set({ objective: e.target.value })} /></F>
            <F label="Why this matters"><Textarea value={d.whyItMatters} onChange={(e) => set({ whyItMatters: e.target.value })} /></F>
            <F label="Current state"><Textarea value={d.currentState} onChange={(e) => set({ currentState: e.target.value })} /></F>
            <F label="Target state"><Textarea value={d.targetState} onChange={(e) => set({ targetState: e.target.value })} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Current level"><LevelSel value={d.currentLevel} onChange={(l) => set({ currentLevel: l })} /></F>
              <F label="Target level"><LevelSel value={d.targetLevel} onChange={(l) => set({ targetLevel: l })} /></F>
            </div>
          </>)}
          {step === 2 && (<>
            {d.actions.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span><span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")} </span>{a.title} · <span className="text-muted-foreground">{a.type}</span></span>
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => set({ actions: d.actions.filter((_, j) => j !== i) })}>Remove</button>
              </div>
            ))}
            <div className="grid gap-3 rounded-lg border border-dashed p-3">
              <Input value={act.title} onChange={(e) => setAct({ ...act, title: e.target.value })} placeholder="Action" />
              <div className="grid grid-cols-2 gap-2">
                <Sel value={act.type} onChange={(v) => setAct({ ...act, type: v as ActionType })} options={ACTION_TYPES} />
                <Input value={act.owner} onChange={(e) => setAct({ ...act, owner: e.target.value })} placeholder="Owner" />
                <Input value={act.target} onChange={(e) => setAct({ ...act, target: e.target.value })} placeholder="Target" />
                <Input type="date" value={act.due} onChange={(e) => setAct({ ...act, due: e.target.value })} />
              </div>
              <Button size="sm" variant="outline" disabled={!act.title.trim()} onClick={() => { set({ actions: [...d.actions, { ...act, target: act.target || undefined, due: act.due || undefined, done: false }] }); setAct({ ...act, title: "", target: "" }); }}><Plus /> Add action</Button>
            </div>
          </>)}
          {step === 3 && (<>
            <F label="Success criteria">
              <div className="grid gap-2">
                {d.criteria.map((c, i) => <Input key={i} value={c} onChange={(e) => set({ criteria: d.criteria.map((x, j) => (j === i ? e.target.value : x)) })} placeholder={`Criterion ${i + 1}`} />)}
                <Button size="sm" variant="ghost" className="justify-start" onClick={() => set({ criteria: [...d.criteria, ""] })}><Plus /> Add criterion</Button>
              </div>
            </F>
            <F label="Evidence required"><Input value={d.evidenceRequired} onChange={(e) => set({ evidenceRequired: e.target.value })} /></F>
            <F label="Review frequency"><Sel value={d.reviewFrequency} onChange={(v) => set({ reviewFrequency: v })} options={["Fortnightly", "Monthly", "Quarterly", "At each review"]} /></F>
          </>)}
          {step === 4 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <F label="Start date"><Input type="date" value={d.startDate} onChange={(e) => set({ startDate: e.target.value })} /></F>
              <F label="Target completion"><Input type="date" value={d.targetDate} onChange={(e) => set({ targetDate: e.target.value })} /></F>
              <F label="Next check-in"><Input type="date" value={d.nextReviewDate} onChange={(e) => set({ nextReviewDate: e.target.value })} /></F>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3 rounded-lg border bg-background p-4 text-sm">
              <div className="text-base font-semibold">{d.title}</div>
              <div className="text-muted-foreground">{d.category} · {d.sourceType}</div>
              <div>Level {d.currentLevel} → Level {d.targetLevel} · {d.actions.length} actions · {d.criteria.filter((c) => c.trim()).length} criteria</div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div><div className="eyebrow">Employee</div>{employee.name}</div>
                <div><div className="eyebrow">Manager</div>{employee.managerName}</div>
              </div>
              <F label="Development plan agreed on"><Input type="date" value={d.agreedOn} onChange={(e) => set({ agreedOn: e.target.value })} /></F>
              {role === "employee" && <p className="text-xs text-muted-foreground">This will be sent to your manager as a proposed goal.</p>}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < STEPS.length - 1 ? <Button disabled={!valid} onClick={() => setStep(step + 1)}>Continue</Button> : <Button onClick={save}>Save Development Plan</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
