import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Avatar, Protected } from "@/components/pair/Protected";
import { EmptyState, PageHeader, relTime } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";
import { cn } from "@/lib/utils";
import { Icebreakers } from "@/components/pair/Icebreakers";
import { CloudAccount, useCloudAccount } from "@/components/pair/CloudAccount";
import { listCloudChats } from "@/lib/pair/chats.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — PAIR" },
      { name: "description", content: "Your conversations on PAIR." },
      { property: "og:title", content: "Messages — PAIR" },
      { property: "og:description", content: "Keep the conversation going with your matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <Messages />
    </Protected>
  ),
});

function Messages() {
  const s = usePair();
  const account = useCloudAccount();
  const list = useServerFn(listCloudChats);
  const chats = useQuery({ queryKey: ["cloud-chat-list", account.user?.id], enabled: !!account.user, queryFn: () => list(), retry: false });
  const rows = s.matches
    .filter((m) => !m.archived)
    .map((m) => {
      const saved = chats.data?.find((x) => x.matchId === m.id);
      const last = saved?.at ? { text: saved.text, at: Date.parse(saved.at), from: "them" } : undefined;
      return { m, last, unread: 0, p: getProfile(m.profileId) };
    })
    .sort((a, b) => (b.last?.at ?? b.m.at) - (a.last?.at ?? a.m.at));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Messages" />
        {account.user && <Icebreakers />}
      </div>
      {!account.ready ? <p role="status">Loading account…</p> : !account.user ? <CloudAccount /> : rows.length === 0 ? (
        <EmptyState icon={<MessageCircle className="h-6 w-6" />} title="No conversations yet" body="Match with someone to start chatting." action={<Button asChild><Link to="/discover">Discover</Link></Button>} />
      ) : (
        <ul className="card-surface divide-y divide-border overflow-hidden">
          {rows.map(({ m, last, unread, p }) =>
            p ? (
              <li key={m.id}>
                <Link to="/chat/$matchId" params={{ matchId: m.id }} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary">
                  <Avatar src={p.photos[0]} name={p.name} size={52} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-lg">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{relTime(last?.at ?? m.at)}</span>
                    </div>
                    <p className={cn("truncate text-sm", unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {last ? `${last.from === "me" ? "You: " : ""}${last.text}` : "Say hello 👋"}
                    </p>
                  </div>
                  {unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{unread}</span>}
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </>
  );
}
