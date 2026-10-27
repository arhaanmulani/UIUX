import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users } from "lucide-react";
import { Avatar, Protected } from "@/components/pair/Protected";
import { EmptyState, PageHeader, relTime } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { actions, usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches — PAIR" },
      { name: "description", content: "Everyone you've matched with on PAIR." },
      { property: "og:title", content: "Matches — PAIR" },
      { property: "og:description", content: "Your mutual connections, all in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <Matches />
    </Protected>
  ),
});

function Matches() {
  const s = usePair();
  const [archived, setArchived] = useState(false);
  const list = s.matches.filter((m) => !!m.archived === archived).sort((a, b) => b.at - a.at);

  return (
    <>
      <PageHeader
        eyebrow={`${s.matches.length} total`}
        title="Matches"
        actions={<Button variant="outline" onClick={() => setArchived(!archived)}>{archived ? "Show active" : "Show archived"}</Button>}
      />
      {list.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title={archived ? "Nothing archived" : "No matches yet"} body="When someone likes you back, they'll appear here." action={<Button asChild><Link to="/discover">Discover</Link></Button>} />
      ) : (
        <ul className="grid gap-3">
          {list.map((m) => {
            const p = getProfile(m.profileId);
            if (!p) return null;
            return (
              <li key={m.id} className="card-surface flex flex-wrap items-center gap-4 p-4">
                <Avatar src={p.photos[0]} name={p.name} size={56} />
                <div className="min-w-0 flex-1">
                  <Link to="/profile/$id" params={{ id: p.id }} className="font-display text-xl hover:text-primary">{p.name}, {p.age}</Link>
                  <p className="text-sm text-muted-foreground">{m.origin ?? "Matched"} · {relTime(m.at)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => actions.archiveMatch(m.id, !archived)}>{archived ? "Unarchive" : "Archive"}</Button>
                <Button size="sm" asChild><Link to="/chat/$matchId" params={{ matchId: m.id }}>Message</Link></Button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
