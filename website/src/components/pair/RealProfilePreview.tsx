import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Pencil, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ownedProfile } from "@/lib/pair/real-profile";
import { Button } from "@/components/ui/button";
import { CloudAccount, useCloudAccount } from "./CloudAccount";
import { Chip, EmptyState } from "./primitives";

export function RealProfilePreview() {
  const account = useCloudAccount();
  const userId = account.user?.id;
  const query = useQuery({
    queryKey: ["real-profile-preview", userId],
    enabled: !!userId,
    retry: false,
    staleTime: 0,
    queryFn: async () => {
      if (!userId) throw new Error("Sign in to view your profile.");
      const result = await supabase.from("dater_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (result.error) throw new Error("Your saved profile couldn't be loaded.");
      const profile = ownedProfile(result.data, userId);
      if (!profile) return null;
      const signed = profile.photos.length
        ? await supabase.storage.from("dater-photos").createSignedUrls(profile.photos, 3600)
        : null;
      if (signed?.error || signed?.data?.some((photo) => photo.error)) {
        throw new Error("Your photos couldn't be loaded. Please try again.");
      }
      return { ...profile, photoUrls: signed?.data?.map((photo) => photo.signedUrl).filter((url): url is string => typeof url === "string" && url.length > 0) ?? [] };
    },
  });

  if (!account.ready) return <p role="status">Loading account…</p>;
  if (!account.user) return <CloudAccount profiles />;
  if (query.isPending) return <p role="status">Loading your saved profile…</p>;
  if (query.error) return <div className="py-8"><p role="alert" className="mb-4 text-destructive">{query.error.message}</p><Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="h-4 w-4" />Try again</Button></div>;
  const profile = query.data;
  if (!profile) return <EmptyState title="Your profile belongs here" body="Add your photos, bio and interests to your real PAIR profile." action={<Button asChild><Link to="/profile/edit">Create my profile</Link></Button>} />;

  return <section aria-label="Your saved real profile">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><p className="eyebrow">Your real profile</p><p className="mt-1 text-sm text-muted-foreground">{profile.is_published ? "Published · Visible to signed-in daters" : "Private · Visible only to you"}</p></div>
      <Button asChild variant="outline"><Link to="/profile/edit"><Pencil className="h-4 w-4" />Edit profile</Link></Button>
    </div>
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="space-y-3">
        {profile.photoUrls[0] && <img src={profile.photoUrls[0]} alt={`${profile.name}'s main profile photo`} className="aspect-[4/5] w-full rounded-lg object-cover" />}
        <div className="grid grid-cols-3 gap-2">{profile.photoUrls.slice(1).map((url, i) => <img key={url} src={url} alt={`${profile.name}'s profile photo ${i + 2}`} className="aspect-square w-full rounded-lg object-cover" />)}</div>
      </div>
      <div className="min-w-0 space-y-6">
        <div><h2 className="break-words text-3xl">{profile.name}</h2><p className="mt-2 break-words text-muted-foreground">{profile.city}</p></div>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{profile.bio}</p>
        <div className="flex flex-wrap gap-2">{profile.interests.map((interest) => <Chip key={interest}>{interest}</Chip>)}</div>
      </div>
    </div>
  </section>;
}