import type { ReactNode } from "react";
import hero from "@/assets/p3.jpg";
import { Logo } from "./primitives";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col px-6 py-8 md:px-16">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-5xl">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Demo mode — accounts and data stay in this browser. Passwords are never stored.
        </p>
      </div>
      <div className="relative hidden md:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-10 bottom-10 rounded-[var(--radius)] bg-card/95 p-6 shadow-[var(--shadow-lift)]">
          <p className="text-sm font-semibold text-muted-foreground">We'll get along if...</p>
          <p className="mt-2 font-display text-2xl">You have strong opinions about bakeries and soft opinions about everything else.</p>
        </div>
      </div>
    </div>
  );
}
