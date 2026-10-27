import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, Protected } from "@/components/pair/Protected";
import { Chip, PageHeader } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { usePair } from "@/lib/pair/store";
import { ageFromDob } from "@/lib/pair/compatibility";
import { INTENTION_LABEL } from "@/lib/pair/types";

export const Route = createFileRoute("/profile/me")({
  head: () => ({
    meta: [
      { title: "My profile — PAIR" },
      { name: "description", content: "See how your PAIR profile looks to others." },
      { property: "og:title", content: "My profile — PAIR" },
      { property: "og:description", content: "Preview and edit your PAIR profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <Me />
    </Protected>
  ),
});

function Me() {
  const { me, user } = usePair();
  const age = ageFromDob(me.dob || user?.dob || "");
  const checks = [me.photos.length > 0, !!me.city, !!me.occupation, me.prompts.length >= 2, me.interests.length >= 3];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <>
      <PageHeader eyebrow={`Profile ${pct}% complete`} title="My profile" actions={<div className="flex gap-2"><Button asChild variant="outline"><Link to="/profile/create">Edit demo profile</Link></Button><Button asChild><Link to="/profile/edit">My real profile</Link></Button></div>} />
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          {me.photos[0] ? <img src={me.photos[0]} alt="Your main photo" className="aspect-[4/5] w-full rounded-[var(--radius)] object-cover" /> : (
            <div className="card-surface flex aspect-[4/5] flex-col items-center justify-center gap-3 p-6 text-center">
              <Avatar name={me.name} size={72} />
              <p className="text-sm text-muted-foreground">Add a photo so matches can see you.</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">{me.photos.slice(1).map((p, i) => <img key={i} src={p} alt="" className="aspect-square rounded-lg object-cover" />)}</div>
        </div>
        <div className="space-y-6">
          <div className="card-surface p-6">
            <h2 className="text-3xl">{me.name || "Your name"}{age > 0 && `, ${age}`}</h2>
            <p className="mt-1 text-muted-foreground">{[me.pronouns, me.occupation, me.city].filter(Boolean).join(" · ") || "Add details in the profile builder."}</p>
            {me.intention && <p className="mt-3 text-sm font-semibold text-primary">{INTENTION_LABEL[me.intention]}</p>}
            <div className="mt-4 flex flex-wrap gap-2">{me.interests.map((i) => <Chip key={i}>{i}</Chip>)}</div>
          </div>
          {me.prompts.map((p) => (
            <div key={p.question} className="card-surface p-6">
              <p className="eyebrow">{p.question}</p>
              <p className="mt-2 font-display text-2xl leading-snug">{p.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
