import type { Database } from "@/integrations/supabase/types";

export type RealProfile = Database["public"]["Tables"]["dater_profiles"]["Row"];

/** Owner-only profiles must never enter the fictional discovery queue. */
export function ownedProfile(profile: RealProfile | null, userId: string): RealProfile | null {
  return profile?.user_id === userId ? profile : null;
}

export function discoverableProfile(profile: RealProfile, viewerId: string): boolean {
  return profile.is_published && profile.user_id !== viewerId;
}