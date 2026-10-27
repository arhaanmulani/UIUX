import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Heart, MapPin, Briefcase, GraduationCap, Languages, Sparkles, X, MoreHorizontal, Flag, Ban } from "lucide-react";
import { toast } from "sonner";
import type { LikeTarget, Profile } from "@/lib/pair/types";
import { INTENTION_LABEL } from "@/lib/pair/types";
import { actions, usePair } from "@/lib/pair/store";
import { compatibility } from "@/lib/pair/compatibility";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "./primitives";
import { cn } from "@/lib/utils";

function LikeChip({ onClick, label, liked }: { onClick: () => void; label: string; liked?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={liked}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border shadow-[var(--shadow-soft)] transition-all duration-200 hover:scale-105",
        liked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:border-primary",
      )}
    >
      <Heart className={cn("h-5 w-5", liked && "fill-current")} />
    </button>
  );
}

export function ProfileView({ profile, onPassed, compact }: { profile: Profile; onPassed?: () => void; compact?: boolean }) {
  const s = usePair();
  const navigate = useNavigate();
  const [target, setTarget] = useState<LikeTarget | null>(null);
  const [comment, setComment] = useState("");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const comp = compatibility(s.me, profile);
  const alreadyLiked = s.likesSent.some((l) => l.profileId === profile.id);

  const targetLabel = (t: LikeTarget) =>
    t.type === "prompt" ? profile.prompts[t.index]?.question : t.type === "photo" ? "their photo" : "their profile";

  function sendLike() {
    if (!target) return;
    const m = actions.like(profile.id, target, comment);
    setTarget(null);
    setComment("");
    if (m) setMatchId(m);
    else toast.success(`Like sent to ${profile.name}`, { description: comment ? "Your comment was included." : undefined });
  }

  const blocks = [
    <figure key="photo0" className="relative overflow-hidden rounded-[var(--radius)] bg-muted">
      <img src={profile.photos[0]} alt={`${profile.name}, photo 1`} width={768} height={960} className="aspect-[4/5] w-full object-cover" />
      <div className="absolute bottom-4 right-4">
        <LikeChip liked={alreadyLiked} label={`Like ${profile.name}'s photo`} onClick={() => setTarget({ type: "photo", index: 0 })} />
      </div>
    </figure>,
    ...profile.prompts.map((p, i) => (
      <div key={`p${i}`} className="card-surface relative p-7 pr-20">
        <p className="text-sm font-semibold text-muted-foreground">{p.question}</p>
        <p className="mt-3 font-display text-2xl leading-snug md:text-[1.7rem]">{p.answer}</p>
        <div className="absolute bottom-5 right-5">
          <LikeChip liked={alreadyLiked} label={`Like prompt: ${p.question}`} onClick={() => setTarget({ type: "prompt", index: i })} />
        </div>
      </div>
    )),
  ];

  const details = (
    <div className="card-surface grid gap-3 p-6 text-sm sm:grid-cols-2">
      <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />{profile.occupation}</span>
      {profile.education && <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" />{profile.education}</span>}
      <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" />{INTENTION_LABEL[profile.intention]}</span>
      <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-muted-foreground" />{profile.languages.join(", ")}</span>
    </div>
  );

  const why = comp.reasons.length > 0 && (
    <div className="rounded-[var(--radius)] border border-primary/25 bg-primary-soft/60 p-6">
      <p className="eyebrow !text-accent-foreground">Why {profile.name}?</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {comp.reasons.map((r) => (
          <li key={r} className="flex gap-2"><span className="text-primary">•</span>{r}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Based on overlap in your profiles — not a prediction.</p>
    </div>
  );

  return (
    <article aria-label={`${profile.name}'s profile`} className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-4xl md:text-5xl">
            {profile.name}
            {s.settings.showAge && <span className="text-muted-foreground">{profile.age}</span>}
            {profile.verified && <BadgeCheck className="h-6 w-6 text-primary" aria-label="Photo verified" />}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {profile.city}
            {s.settings.showDistance && ` · ${profile.distanceKm} km away`}
            {profile.pronouns && ` · ${profile.pronouns}`}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More options"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setReportOpen(true)}><Flag className="h-4 w-4" /> Report</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                actions.block(profile.id);
                toast(`${profile.name} is blocked`, { description: "They won't see you or contact you." });
                onPassed?.();
              }}
            >
              <Ban className="h-4 w-4" /> Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {blocks[0]}
      {why}
      {details}
      {blocks.slice(1)}
      <div className="card-surface p-6">
        <p className="eyebrow mb-3">Interests</p>
        <div className="flex flex-wrap gap-2">
          {profile.interests.map((i) => (
            <Chip key={i} highlight={comp.shared.includes(i)}>{i}</Chip>
          ))}
        </div>
        {comp.shared.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Highlighted interests are ones you share.</p>}
      </div>

      <div className="sticky bottom-20 z-10 flex justify-center gap-3 md:bottom-6">
        {onPassed && (
          <Button variant="outline" size="lg" className="shadow-[var(--shadow-lift)]" onClick={() => { actions.pass(profile.id); onPassed(); }}>
            <X /> Pass
          </Button>
        )}
        {!alreadyLiked ? (
          <Button size="lg" className="shadow-[var(--shadow-lift)]" onClick={() => setTarget({ type: "profile" })}>
            <Heart /> Like profile
          </Button>
        ) : (
          <Button size="lg" variant="soft" disabled>Liked</Button>
        )}
        {compact && (
          <Button variant="ghost" size="lg" asChild><Link to="/profile/$id" params={{ id: profile.id }}>Full profile</Link></Button>
        )}
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">Like {targetLabel(target ?? { type: "profile" })}</DialogTitle>
            <DialogDescription>A thoughtful comment makes a much better first impression than a like alone.</DialogDescription>
          </DialogHeader>
          {target?.type === "prompt" && (
            <blockquote className="rounded-xl bg-secondary p-4 font-display text-lg">“{profile.prompts[target.index].answer}”</blockquote>
          )}
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 280))}
            placeholder={`Say something to ${profile.name} about this… (optional)`}
            aria-label="Comment"
            className="min-h-24 rounded-xl"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{comment.length}/280</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
              <Button onClick={sendLike}><Heart /> {comment.trim() ? "Send like & comment" : "Send like"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!matchId} onOpenChange={(o) => !o && setMatchId(null)}>
        <DialogContent className="rounded-[var(--radius)] text-center">
          <div className="mx-auto flex -space-x-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-primary-soft font-display text-3xl text-primary">
              {s.me.photos[0] ? <img src={s.me.photos[0]} alt="You" className="h-full w-full rounded-full object-cover" /> : (s.me.name || "You")[0]}
            </div>
            <img src={profile.photos[0]} alt={profile.name} className="h-24 w-24 rounded-full border-4 border-card object-cover" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center font-display text-4xl font-normal">It's a match</DialogTitle>
            <DialogDescription className="text-center">
              You and {profile.name} liked each other. {!s.likesReceived.some((l) => l.profileId === profile.id) && "(Demo: fictional profiles like you back.)"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate({ to: "/chat/$matchId", params: { matchId: matchId! } })}>Send a message</Button>
            <Button variant="outline" onClick={() => { setMatchId(null); onPassed?.(); }}>Continue discovering</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">Report {profile.name}</DialogTitle>
            <DialogDescription>Reports are confidential. {profile.name} won't know you reported them.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {["Fake profile", "Inappropriate content", "Harassment", "Underage", "Scam or spam", "Something else"].map((r) => (
              <Chip key={r} selected={reason === r} onClick={() => setReason(r)}>{r}</Chip>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button disabled={!reason} onClick={() => { actions.report(profile.id, reason); setReportOpen(false); setReason(""); toast.success("Report received", { description: "Thank you. Our team reviews every report." }); }}>Submit report</Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
