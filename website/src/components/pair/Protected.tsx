import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePair } from "@/lib/pair/store";
import { AppShell } from "./AppShell";

/** Client-side gate for the demo: sends signed-out visitors to Sign In. */
export function Protected({ children, shell = true }: { children: ReactNode; shell?: boolean }) {
  const s = usePair();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !s.user) navigate({ to: "/login" });
  }, [mounted, s.user, navigate]);
  if (!mounted || !s.user) return <div className="min-h-screen" aria-busy="true" />;
  return shell ? <AppShell>{children}</AppShell> : <div className="mx-auto min-h-screen max-w-2xl px-5 py-10">{children}</div>;
}

export function Avatar({ src, name, size = 48 }: { src?: string; name: string; size?: number }) {
  return src ? (
    <img src={src} alt="" width={size} height={size} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-lg text-primary">
      {name.slice(0, 1) || "?"}
    </span>
  );
}
