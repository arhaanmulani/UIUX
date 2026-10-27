import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { RefreshCw, Users } from "lucide-react";
import { listRealDiscovery } from "@/lib/pair/discovery.functions";
import { Button } from "@/components/ui/button";
import { CloudAccount, useCloudAccount } from "./CloudAccount";
import { Chip, EmptyState } from "./primitives";

export function RealDiscovery() {
  const account = useCloudAccount();
  const load = useServerFn(listRealDiscovery);
  const query = useQuery({
    queryKey: ["real-discovery", account.user?.id],
    enabled: Boolean(account.user),
    queryFn: () => load(), retry: false, staleTime: 0, refetchInterval: 240_000,
  });
  if (!account.ready) return <p role="status">Loading account…</p>;
  if (!account.user) return <CloudAccount profiles />;
  if (query.isPending) return <p role="status">Loading real profiles…</p>;
  if (query.error) return <div className="space-y-4"><p role="alert" className="text-destructive">{query.error.message}</p><Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="h-4 w-4" />Try again</Button></div>;
  if (!query.data?.length) return <EmptyState icon={<Users className="h-6 w-6" />} title="No published profiles yet" body="No other daters have published their profiles yet." action={<Button asChild><Link to="/profile/edit">My profile</Link></Button>} />;
  return <section aria-label="Real daters" className="space-y-8">
    <div className="flex items-center justify-between gap-4"><h2 className="text-2xl">Real daters</h2><Button variant="outline" size="icon" aria-label="Refresh real profiles" title="Refresh real profiles" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw className="h-4 w-4" /></Button></div>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {query.data.map((profile) => <article key={profile.id} className="overflow-hidden rounded-lg border border-border bg-card">
        {profile.photoUrls[0] && <img src={profile.photoUrls[0]} alt={`${profile.name}'s profile photo`} className="aspect-[4/5] w-full object-cover" />}
        <div className="space-y-4 p-5">
          <div><h3 className="break-words text-2xl">{profile.name}</h3><p className="break-words text-sm text-muted-foreground">{profile.city}</p></div>
          <p className="whitespace-pre-wrap break-words leading-relaxed">{profile.bio}</p>
          <div className="flex flex-wrap gap-2">{profile.interests.map((interest) => <Chip key={interest}>{interest}</Chip>)}</div>
          {profile.photoUrls.length > 1 && <div className="grid grid-cols-3 gap-2">{profile.photoUrls.slice(1).map((url, i) => <img key={url} src={url} alt={`${profile.name}'s photo ${i + 2}`} className="aspect-square w-full rounded-lg object-cover" />)}</div>}
        </div>
      </article>)}
    </div>
  </section>;
}