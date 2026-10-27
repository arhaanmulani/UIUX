import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Heart, MessageCircle, CalendarHeart, User, Settings, ShieldCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import { usePair } from "@/lib/pair/store";
import { Logo, DemoBadge } from "./primitives";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/likes", label: "Likes", icon: Heart },
  { to: "/matches", label: "Matches", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/dates", label: "Dates", icon: CalendarHeart },
  { to: "/profile/me", label: "Profile", icon: User },
] as const;

const MOBILE = ["/discover", "/likes", "/messages", "/dates", "/profile/me"];

export function AppShell({ children }: { children: ReactNode }) {
  const s = usePair();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const unread = s.messages.filter((m) => !m.read && m.from === "them").length;
  const likes = s.likesReceived.filter((l) => !s.blocks.includes(l.profileId)).length;
  const badge = (to: string) => (to === "/messages" ? unread : to === "/likes" ? likes : 0);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border px-5 py-7 md:flex">
        <div className="flex items-center gap-2 px-2">
          <Logo />
          <DemoBadge />
        </div>
        <nav aria-label="Main" className="mt-10 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to) || (to === "/messages" && path.startsWith("/chat"));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  active ? "bg-card text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active && "text-primary")} />
                <span className="flex-1">{label}</span>
                {badge(to) > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{badge(to)}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <Link to="/safety" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ShieldCheck className="h-[18px] w-[18px]" /> Safety Center
          </Link>
          <Link to="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Settings className="h-[18px] w-[18px]" /> Settings
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-5 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <Logo className="text-xl" />
          <DemoBadge />
        </div>
        <div className="flex gap-1">
          <Link to="/matches" aria-label="Matches" className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><Users className="h-5 w-5" /></Link>
          <Link to="/safety" aria-label="Safety Center" className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><ShieldCheck className="h-5 w-5" /></Link>
          <Link to="/settings" aria-label="Settings" className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><Settings className="h-5 w-5" /></Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-28 pt-8 md:px-10 md:pb-16 md:pt-12">{children}</main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.filter((n) => MOBILE.includes(n.to)).map(({ to, label, icon: Icon }) => {
          const active = path.startsWith(to) || (to === "/messages" && path.startsWith("/chat"));
          return (
            <Link key={to} to={to} className={cn("relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              {label}
              {badge(to) > 0 && <span className="absolute right-[28%] top-1.5 h-2 w-2 rounded-full bg-primary" aria-label={`${badge(to)} new`} />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
