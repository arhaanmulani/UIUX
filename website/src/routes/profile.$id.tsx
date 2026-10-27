import { createFileRoute, Link } from "@tanstack/react-router";
import { Protected } from "@/components/pair/Protected";
import { ProfileView } from "@/components/pair/ProfileView";
import { EmptyState } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/pair/seed";
import { usePair } from "@/lib/pair/store";

export const Route = createFileRoute("/profile/$id")({
  head: () => ({
    meta: [
      { title: "Profile — PAIR" },
      { name: "description", content: "View a profile on PAIR." },
      { property: "og:title", content: "Profile — PAIR" },
      { property: "og:description", content: "Get to know someone through their prompts and photos." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <ProfilePage />
    </Protected>
  ),
});

function ProfilePage() {
  const { id } = Route.useParams();
  const s = usePair();
  const p = getProfile(id);
  if (!p || p.unavailable || s.blocks.includes(id)) {
    return <EmptyState title="Profile unavailable" body="This person may have paused or left PAIR." action={<Button asChild><Link to="/discover">Back to Discover</Link></Button>} />;
  }
  return <ProfileView profile={p} />;
}
