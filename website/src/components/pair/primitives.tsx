import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("font-display text-2xl tracking-tight text-foreground", className)} aria-label="PAIR home">
      PAIR<span className="text-primary">.</span>
    </Link>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center px-8 py-14 text-center">
      {icon && <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">{icon}</div>}
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, body, actions }: { eyebrow?: string; title: string; body?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {body && <p className="mt-2 max-w-xl text-muted-foreground">{body}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Chip({ selected, children, onClick, highlight }: { selected?: boolean; highlight?: boolean; children: ReactNode; onClick?: () => void }) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150",
    selected ? "border-primary bg-primary-soft text-accent-foreground" : highlight ? "border-primary/40 bg-primary-soft/60 text-accent-foreground" : "border-border bg-card text-foreground",
    onClick && "cursor-pointer hover:border-primary/60",
  );
  if (!onClick) return <span className={cls}>{children}</span>;
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function DemoBadge({ children = "Demo" }: { children?: ReactNode }) {
  return <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-warning">{children}</span>;
}

export function relTime(at: number) {
  const diff = Date.now() - at;
  const m = Math.round(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDate(date: string, time?: string) {
  const d = new Date(`${date}T${time || "12:00"}`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", ...(time ? { hour: "numeric", minute: "2-digit" } : {}) });
}
