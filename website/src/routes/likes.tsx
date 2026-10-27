import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/pair/Protected";
import { EmptyState, PageHeader, relTime } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { actions, usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";

export const Route = createFileRoute("/likes")({
  head: () => ({
    meta: [
      { title: "Likes — PAIR" },
      { name: "description", content: "See who liked your profile on PAIR." },
      { property: "og:title", content: "Likes — PAIR" },
      { property: "og:description", content: "People who liked something specific about you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <Likes />
    </Protected>
  ),
});

function Likes() {
  const s = usePair();
  const navigate = useNavigate();
  const likes = s.likesReceived.filter((l) => !s.blocks.includes(l.profileId));

  return (
    <>
      <PageHeader eyebrow="Liked you" title="Likes" body="Like someone back to match and start talking." />
      {likes.length === 0 ? (
        <EmptyState icon={<Heart className="h-6 w-6" />} title="No new likes yet" body="Thoughtful prompts get more likes. Keep discovering in the meantime." action={<Button asChild><Link to="/discover">Discover</Link></Button>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {likes.map((l) => {
            const p = getProfile(l.profileId);
            if (!p) return null;
            const what = l.target.type === "prompt" ? `your prompt "${s.me.prompts[l.target.index]?.question ?? "a prompt"}"` : l.target.type === "photo" ? "your photo" : "your profile";
            return (
              <article key={l.id} className="card-surface overflow-hidden">
                <Link to="/profile/$id" params={{ id: p.id }}>
                  <img src={p.photos[0]} alt={p.name} className="aspect-[4/3] w-full object-cover" />
                </Link>
                <div className="space-y-3 p-5">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-2xl">{p.name}, {p.age}</h2>
                    <span className="text-xs text-muted-foreground">{relTime(l.at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Liked {what}</p>
                  {l.comment && <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm">"{l.comment}"</p>}
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1" onClick={() => { actions.declineLike(p.id); toast(`Passed on ${p.name}`); }}>Pass</Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        const m = actions.like(p.id, { type: "profile" });
                        if (m) {
                          toast.success(`It's a match with ${p.name}!`);
                          navigate({ to: "/chat/$matchId", params: { matchId: m } });
                        }
                      }}
                    ><Heart className="h-4 w-4" /> Like back</Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
