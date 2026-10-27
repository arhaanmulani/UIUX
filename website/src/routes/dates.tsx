import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarHeart, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Protected } from "@/components/pair/Protected";
import { Chip, EmptyState, PageHeader, formatDate } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { actions, usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";
import type { DatePlan, Feedback } from "@/lib/pair/types";

export const Route = createFileRoute("/dates")({
  head: () => ({
    meta: [
      { title: "Dates — PAIR" },
      { name: "description", content: "Plan, confirm and reflect on your dates." },
      { property: "og:title", content: "Dates — PAIR" },
      { property: "og:description", content: "Your upcoming and past dates on PAIR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <Dates />
    </Protected>
  ),
});

const CHECKLIST = ["Meet somewhere public", "Tell a friend where I'll be", "Arrange my own way home", "Keep my phone charged"];
const STATUS: Record<DatePlan["status"], string> = { draft: "Draft", sent: "Awaiting reply", accepted: "Confirmed", declined: "Declined", counter: "New time proposed", cancelled: "Cancelled", completed: "Completed" };

function Dates() {
  const s = usePair();
  const [fb, setFb] = useState<DatePlan | null>(null);
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = s.dates.filter((d) => ["sent", "accepted", "counter"].includes(d.status) && d.date >= now).sort((a, b) => a.date.localeCompare(b.date));
  const past = s.dates.filter((d) => !upcoming.includes(d));

  return (
    <>
      <PageHeader title="Dates" body="Meet in public, tell someone you trust, and trust your instincts." />
      {s.dates.length === 0 ? (
        <EmptyState icon={<CalendarHeart className="h-6 w-6" />} title="No dates planned" body="Open a conversation and tap “Plan a date”." action={<Button asChild><Link to="/messages">Messages</Link></Button>} />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-2xl">Upcoming</h2>
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing upcoming.</p>}
            <div className="grid gap-4">{upcoming.map((d) => <DateCard key={d.id} d={d} onFeedback={() => setFb(d)} />)}</div>
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl">Past & closed</h2>
              <div className="grid gap-4">{past.map((d) => <DateCard key={d.id} d={d} onFeedback={() => setFb(d)} />)}</div>
            </section>
          )}
        </div>
      )}
      <FeedbackDialog d={fb} onClose={() => setFb(null)} />
    </>
  );
}

function DateCard({ d, onFeedback }: { d: DatePlan; onFeedback: () => void }) {
  const s = usePair();
  const match = s.matches.find((m) => m.id === d.matchId);
  const p = match ? getProfile(match.profileId) : undefined;
  const [contact, setContact] = useState(d.trustedContact ?? "");
  if (!p) return null;
  const given = s.feedback.some((f) => f.dateId === d.id);
  const active = d.status === "sent" || d.status === "accepted";

  return (
    <article className="card-surface space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar src={p.photos[0]} name={p.name} size={52} />
        <div className="flex-1">
          <h3 className="text-xl">{d.type} with {p.name}</h3>
          <p className="text-sm text-muted-foreground">{formatDate(d.date, d.time)}</p>
        </div>
        <Chip highlight={d.status === "accepted"}>{STATUS[d.status]}</Chip>
      </div>
      <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> {d.venue}{d.address && ` · ${d.address}`}</p>
      {d.note && <p className="text-sm text-muted-foreground">"{d.note}"</p>}

      {d.status === "accepted" && (
        <div className="rounded-xl bg-secondary p-4">
          <p className="mb-3 text-sm font-semibold">Safety checklist</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CHECKLIST.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <Checkbox checked={!!d.checklist[c]} onCheckedChange={(v) => actions.updateDate(d.id, { checklist: { ...d.checklist, [c]: !!v } })} /> {c}
              </label>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input aria-label="Trusted contact" placeholder="Trusted contact's name or number" value={contact} onChange={(e) => setContact(e.target.value)} />
            <Button variant="outline" onClick={() => { actions.updateDate(d.id, { trustedContact: contact }); toast.success("Trusted contact saved (demo — nothing is sent)"); }}>Save</Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {d.status === "sent" && d.proposer === "them" && (
          <>
            <Button size="sm" onClick={() => { actions.updateDate(d.id, { status: "accepted" }); toast.success("Date confirmed"); }}>Accept</Button>
            <Button size="sm" variant="outline" onClick={() => actions.updateDate(d.id, { status: "declined" })}>Decline</Button>
          </>
        )}
        {active && <Button size="sm" variant="ghost" onClick={() => { actions.updateDate(d.id, { status: "cancelled" }); toast("Date cancelled"); }}>Cancel date</Button>}
        {(d.status === "accepted" || d.status === "completed") && !given && <Button size="sm" variant="outline" onClick={onFeedback}>How did it go?</Button>}
        {given && <span className="text-sm text-success">Feedback shared — thank you</span>}
        <Button size="sm" variant="ghost" asChild><Link to="/chat/$matchId" params={{ matchId: d.matchId }}>Open chat</Link></Button>
      </div>
    </article>
  );
}

function FeedbackDialog({ d, onClose }: { d: DatePlan | null; onClose: () => void }) {
  const [happened, setHappened] = useState<Feedback["happened"]>("yes");
  const [feeling, setFeeling] = useState(4);
  const [cont, setCont] = useState<Feedback["continue"]>("maybe");
  const [report, setReport] = useState("");
  return (
    <Dialog open={!!d} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>How did it go?</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div><p className="mb-2 text-sm font-semibold">Did the date happen?</p>
            <div className="flex gap-2">{(["yes", "no", "rescheduled"] as const).map((v) => <Chip key={v} selected={happened === v} onClick={() => setHappened(v)}>{v[0].toUpperCase() + v.slice(1)}</Chip>)}</div></div>
          <div><p className="mb-2 text-sm font-semibold">How did you feel? ({feeling}/5)</p>
            <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <Chip key={n} selected={feeling === n} onClick={() => setFeeling(n)}>{n}</Chip>)}</div></div>
          <div><p className="mb-2 text-sm font-semibold">See them again?</p>
            <div className="flex gap-2">{(["yes", "maybe", "no"] as const).map((v) => <Chip key={v} selected={cont === v} onClick={() => setCont(v)}>{v[0].toUpperCase() + v.slice(1)}</Chip>)}</div></div>
          <Textarea aria-label="Anything we should know?" placeholder="Anything that made you uncomfortable? (private)" value={report} onChange={(e) => setReport(e.target.value)} />
          <Button className="w-full" onClick={() => { if (d) actions.submitFeedback({ dateId: d.id, happened, feeling, continue: cont, report }); toast.success("Thanks for sharing"); onClose(); }}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
