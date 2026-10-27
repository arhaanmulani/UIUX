import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { discoverableProfile } from "./real-profile";

export const listRealDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("dater_profiles")
      .select("user_id,name,city,bio,interests,photos,updated_at,is_published")
      .eq("is_published", true).neq("user_id", context.userId)
      .order("updated_at", { ascending: false }).limit(50);
    if (error) throw new Error("Couldn't load real profiles. Please try again.");
    // Photo reads are not granted via storage RLS; sign only paths of published profiles inside the owner's folder.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return Promise.all((data ?? []).filter((profile) => discoverableProfile(profile, context.userId)).map(async (profile) => {
      const paths = profile.photos.filter((p) => p.startsWith(`${profile.user_id}/`) && !p.includes(".."));
      const { data: photos, error: photoError } = paths.length
        ? await supabaseAdmin.storage.from("dater-photos").createSignedUrls(paths, 300)
        : { data: [], error: null };
      if (photoError) throw new Error("Couldn't load profile photos. Please try again.");
      return {
        id: profile.user_id, name: profile.name, city: profile.city,
        bio: profile.bio, interests: profile.interests,
        photoUrls: (photos ?? []).map((photo) => photo.signedUrl).filter((url): url is string => Boolean(url)),
      };
    }));
  });