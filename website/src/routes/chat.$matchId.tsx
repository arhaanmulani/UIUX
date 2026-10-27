import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarHeart, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Protected } from "@/components/pair/Protected";
import { DatePlanner } from "@/components/pair/DatePlanner";
import { CloudChat } from "@/components/pair/CloudChat";
import { CloudAccount, useCloudAccount } from "@/components/pair/CloudAccount";
import { openCloudChat } from "@/lib/pair/chats.functions";
import { icebreakerProfile } from "@/lib/pair/icebreakers";
import { EmptyState, formatDate } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { actions, usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";

export const Route = createFileRoute("/chat/$matchId")({
  head: () => ({
    meta: [
      { title: "Chat — PAIR" },
      { name: "description", content: "Chat with your match on PAIR." },
      { property: "og:title", content: "Chat — PAIR" },
      { property: "og:description", content: "A private conversation with your match." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <Chat />
    </Protected>
  ),
});

function Chat() {
  const { matchId } = Route.useParams();
  const s = usePair();
  const navigate = useNavigate();
  const [planOpen, setPlanOpen] = useState(false);
  const account = useCloudAccount();
  const openChat = useServerFn(openCloudChat);
  const match = s.matches.find((m) => m.id === matchId);
  const p = match ? getProfile(match.profileId) : undefined;
  const pending = s.dates.filter((d) => d.matchId === matchId && (d.status === "sent" || d.status === "accepted"));
  const chat = useQuery({ queryKey: ["cloud-chat", account.user?.id, matchId], enabled: !!account.user && !!p,
    queryFn: () => openChat({ data: { matchId, profileId: p?.id ?? "", dater: icebreakerProfile(s.me) } }), retry: false });

  if (!match || !p) {
    return <EmptyState title="Conversation not found" body="This match may have ended." action={<Button asChild><Link to="/messages">Back to messages</Link></Button>} />;
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col md:h-[calc(100vh-7rem)]">
      <header className="flex items-center gap-3 border-b border-border pb-4">
        <Link to="/messages" aria-label="Back" className="rounded-full p-2 hover:bg-secondary"><ArrowLeft className="h-5 w-5" /></Link>
        <Avatar src={p.photos[0]} name={p.name} size={44} />
        <div className="min-w-0 flex-1"><Link to="/profile/$id" params={{ id: p.id }} className="font-display text-xl hover:text-primary">{p.name}</Link><p className="text-xs text-muted-foreground">AI companion</p></div>
        <Button variant="outline" size="sm" onClick={() => setPlanOpen(true)}><CalendarHeart className="h-4 w-4" /> Plan a date</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { actions.archiveMatch(matchId, true); navigate({ to: "/messages" }); }}>Archive</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { if (confirm(`Unmatch ${p.name}?`)) { actions.unmatch(matchId); toast(`Unmatched ${p.name}`); navigate({ to: "/matches" }); } }}>Unmatch</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm(`Block ${p.name}? They won't be able to see you.`)) { actions.block(p.id); toast(`Blocked ${p.name}`); navigate({ to: "/messages" }); } }}>Block</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {pending.map((d) => (
        <Link key={d.id} to="/dates" className="mt-3 block rounded-xl bg-primary-soft px-4 py-3 text-sm">
          <span className="font-semibold">{d.status === "accepted" ? "Date confirmed" : d.proposer === "me" ? "Invite sent" : `${p.name} invited you`}:</span> {d.type} at {d.venue} · {formatDate(d.date, d.time)}
        </Link>
      ))}

      {!account.ready ? <p role="status">Loading account…</p> : !account.user ? <CloudAccount /> : chat.error ? <p role="alert" className="py-5 text-destructive">{chat.error.message}</p> : chat.data ? <CloudChat key={chat.data.id} threadId={chat.data.id} matchId={matchId} name={p.name} initialMessages={chat.data.messages} /> : <p role="status" className="py-5">Loading saved conversation…</p>}

      <DatePlanner matchId={matchId} name={p.name} open={planOpen} onOpenChange={setPlanOpen} />
    </div>
  );
}
