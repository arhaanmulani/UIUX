import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, CalendarHeart, Sparkles, ShieldCheck, Eye, Flag, Lock, Menu, X } from "lucide-react";
import hero from "@/assets/hero.jpg";
import maya from "@/assets/p1.jpg";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/pair/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PAIR — Less swiping. More meaning." },
      { name: "description", content: "Meet people beyond the profile. PAIR helps you discover real common ground, start better conversations, and plan dates with confidence." },
      { property: "og:title", content: "PAIR — Less swiping. More meaning." },
      { property: "og:description", content: "Meet people who make sense for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#how", label: "How It Works" },
    { href: "#approach", label: "Our Approach" },
    { href: "#safety", label: "Safety" },
  ];
  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {links.map((l) => <a key={l.href} href={l.href} className="hover:text-foreground">{l.label}</a>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild><Link to="/login">Log In</Link></Button>
            <Button asChild><Link to="/signup">Join PAIR</Link></Button>
          </div>
          <button className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 md:hidden">
            {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
            <Button variant="outline" asChild><Link to="/login">Log In</Link></Button>
            <Button asChild><Link to="/signup">Join PAIR</Link></Button>
          </div>
        )}
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.05fr_1fr] md:py-24">
        <div>
          <p className="eyebrow mb-5">Intentional dating</p>
          <h1 className="text-6xl leading-[0.95] md:text-8xl">Less swiping.<br /><em className="text-primary">More meaning.</em></h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
            Meet people beyond the profile. Discover the stories, values, and little things that make a real connection.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/signup">Find Your Person</Link></Button>
            <Button size="lg" variant="outline" asChild><a href="#how">See How It Works</a></Button>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Two people laughing together on a first date in a warm café" width={1280} height={1600} className="aspect-[4/5] w-full rounded-[28px] object-cover" />
          <div className="absolute -bottom-8 -left-4 w-72 rounded-[var(--radius)] border border-border bg-card p-5 shadow-[var(--shadow-lift)] md:-left-12">
            <div className="flex items-center gap-3">
              <img src={maya} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="text-sm"><b>Maya</b> <span className="text-muted-foreground">· My ideal Sunday…</span></div>
            </div>
            <p className="mt-3 font-display text-lg leading-snug">“A slow coffee, a long walk with no destination…”</p>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
              <Heart className="h-4 w-4 fill-primary text-primary" />
              <span className="text-muted-foreground">You: “That sounds like my kind of Sunday.”</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="eyebrow">How PAIR works</p>
          <h2 className="mt-3 max-w-xl text-5xl">Four steps from hello to a real date.</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-4">
            {[
              ["Build a profile", "that shows who you really are — prompts, interests and values."],
              ["Discover people", "with meaningful common ground, explained in plain language."],
              ["Start a conversation", "from something that matters: a prompt, a photo, a shared love."],
              ["Plan a date", "with confidence, with discreet safety tools built in."],
            ].map(([t, b], i) => (
              <li key={t}>
                <span className="font-display text-5xl text-primary">0{i + 1}</span>
                <h3 className="mt-4 text-2xl">{t}</h3>
                <p className="mt-2 text-muted-foreground">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="approach" className="mx-auto max-w-6xl px-6 py-24">
        <p className="eyebrow">Why PAIR</p>
        <h2 className="mt-3 max-w-xl text-5xl">Designed for people who mean it.</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            [Sparkles, "Personality-first profiles", "Prompts and values sit beside your photos, not beneath them."],
            [Heart, "Intentional likes", "Like a specific prompt or photo, and add a comment that starts something."],
            [Eye, "Explainable recommendations", "See exactly why someone appears — shared interests, intentions, languages."],
            [MessageCircle, "Better conversation starters", "Suggestions drawn from what you actually have in common."],
            [CalendarHeart, "Date planning", "Propose a time and place, get a clear yes, and add it to your calendar."],
            [ShieldCheck, "Discreet safety", "Checklists, trusted-contact sharing, reporting and blocking — always one tap away."],
          ].map(([Icon, t, b]) => {
            const I = Icon as typeof Heart;
            return (
              <div key={t as string} className="card-surface p-7">
                <I className="h-6 w-6 text-primary" />
                <h3 className="mt-5 text-2xl">{t as string}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-primary-soft/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="eyebrow">The connection journey</p>
          <div className="mt-10 flex flex-wrap items-center gap-3 font-display text-2xl md:text-3xl">
            {["Discover", "Like a prompt", "Match", "Conversation", "Plan a date", "Meet", "Reflect"].map((s, i, a) => (
              <span key={s} className="flex items-center gap-3">
                {s}
                {i < a.length - 1 && <span className="text-primary">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="eyebrow">Safety and trust</p>
          <h2 className="mt-3 text-5xl">You stay in control.</h2>
          <p className="mt-5 text-muted-foreground">No platform can guarantee safety, but we can give you better tools and clear choices at every step.</p>
        </div>
        <ul className="space-y-5">
          {[
            [ShieldCheck, "Photo verification", "Verified profiles show a badge. We never show one that hasn't been earned."],
            [Lock, "Privacy controls", "Choose whether your age and distance appear. Pause your profile anytime."],
            [Flag, "Report and block", "Confidential reports and instant blocking from any profile or chat."],
            [CalendarHeart, "Date safety", "A pre-date checklist and an easy way to share plans with someone you trust."],
          ].map(([Icon, t, b]) => {
            const I = Icon as typeof Heart;
            return (
              <li key={t as string} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><I className="h-5 w-5" /></span>
                <div><h3 className="text-xl">{t as string}</h3><p className="text-sm text-muted-foreground">{b as string}</p></div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-5xl md:text-6xl">Your next connection starts with a conversation.</h2>
          <Button size="lg" className="mt-10" asChild><Link to="/signup">Join PAIR</Link></Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground">
        <Logo className="text-xl" />
        <div className="flex gap-6">
          <Link to="/safety">Safety</Link>
          <span>Privacy</span>
          <span>Terms</span>
          <span>© 2026 PAIR</span>
        </div>
      </footer>
    </div>
  );
}
