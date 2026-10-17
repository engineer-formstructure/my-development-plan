import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useDev } from "@/lib/dev/store";
import { cn } from "@/lib/utils";

const ME = [
  { label: "My Career Path", to: null },
  { label: "My Development Plan", to: "/me/development" as const },
  { label: "Timesheet & Leave", to: null },
  { label: "Settings", to: null },
];

export function PortalShell({ children }: { children: ReactNode }) {
  const { employees, employee, setEmployeeId, role, setRole } = useDev();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1360px] items-center gap-4 px-4 md:px-8">
          <Link to="/me/development" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-xs text-primary-foreground">F</span>
            FORM <span className="font-normal text-muted-foreground">Portal</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <select aria-label="Demo profile" className="field-select h-8 w-auto text-xs" value={employee.id} onChange={(e) => setEmployeeId(e.target.value)}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <div className="flex rounded-md border p-0.5" role="group" aria-label="View as">
              {(["employee", "manager"] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)} className={cn("rounded px-2.5 py-1 capitalize transition-colors", role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1360px] gap-8 px-4 md:px-8">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 py-8 lg:block">
          <div className="eyebrow mb-3 px-3">Me</div>
          <nav className="space-y-0.5">
            {ME.map((i) =>
              i.to ? (
                <Link key={i.label} to={i.to} className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent" activeProps={{ className: "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" }}>
                  {i.label}
                </Link>
              ) : (
                <span key={i.label} className="block cursor-default px-3 py-2 text-sm text-muted-foreground/60">{i.label}</span>
              ),
            )}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 py-6 md:py-10">{children}</main>
      </div>
    </div>
  );
}
