import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Logo, PageHeader } from "@/components/pair/primitives";
import { AppShell } from "@/components/pair/AppShell";
import { Button } from "@/components/ui/button";
import { usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety Center — PAIR" },
      { name: "description", content: "Tips and tools for dating safely with PAIR." },
      { property: "og:title", content: "Safety Center — PAIR" },
      { property: "og:description", content: "How to meet safely, block, report and get help." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Safety,
});

const TIPS = [
  ["Keep it on PAIR at first", "Chat here until you feel comfortable. Never share financial details or send money."],
  ["Meet in public", "Choose busy cafés, parks or museums for first dates, and arrange your own transport."],
  ["Tell someone you trust", "Share where you're going and who you're meeting. Use the trusted-contact field on your date."],
  ["Trust your instincts", "You can leave any date, any time. Unmatch or block anyone who makes you uncomfortable."],
  ["Block & report", "Open a profile or chat, tap the menu, and choose Block or Report. They won't be told."],
];

function Safety() {
  const s = usePair();
  const body = (
    <>
      <PageHeader eyebrow="Safety Center" title="Date with confidence" body="Small habits that make meeting new people safer." />
      <div className="grid gap-4 md:grid-cols-2">
        {TIPS.map(([t, b]) => (
          <article key={t} className="card-surface p-6">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="mt-3 text-xl">{t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p>
          </article>
        ))}
      </div>
      <section className="card-surface mt-6 p-6">
        <h2 className="text-xl">In an emergency</h2>
        <p className="mt-2 text-sm text-muted-foreground">If you are in immediate danger, contact your local emergency number right away.</p>
      </section>
      {s.user && s.reports.length > 0 && (
        <section className="card-surface mt-6 p-6">
          <h2 className="text-xl">Your reports</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {s.reports.map((r) => <li key={r.at}>{getProfile(r.profileId)?.name ?? "Someone"} — {r.reason} <span className="text-muted-foreground">({new Date(r.at).toLocaleDateString()})</span></li>)}
          </ul>
        </section>
      )}
    </>
  );
  if (s.user) return <AppShell>{body}</AppShell>;
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-10 flex items-center justify-between"><Logo /><Button asChild><Link to="/signup">Join PAIR</Link></Button></div>
      {body}
    </div>
  );
}
