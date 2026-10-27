import type { MyProfile, Preferences, Profile } from "./types";
import { GENDER_TO_PREF, INTENTION_LABEL } from "./types";

/**
 * Transparent overlap — not a scientific score.
 * Score = 2 points per shared interest + 3 if intentions match + 1 per shared language (non-English).
 */
export function compatibility(me: Pick<MyProfile, "interests" | "intention" | "languages">, p: Profile) {
  const shared = p.interests.filter((i) => me.interests.includes(i));
  const sameIntention = !!me.intention && me.intention === p.intention;
  const langs = p.languages.filter((l) => l !== "English" && me.languages.includes(l));
  const reasons: string[] = [];
  shared.slice(0, 3).forEach((i) => reasons.push(`You both enjoy ${i.toLowerCase()}.`));
  if (sameIntention) reasons.push(`You're both looking for: ${INTENTION_LABEL[p.intention].toLowerCase()}.`);
  langs.forEach((l) => reasons.push(`You both speak ${l}.`));
  const score = shared.length * 2 + (sameIntention ? 3 : 0) + langs.length;
  return { score, shared, sameIntention, reasons };
}

export function matchesFilters(p: Profile, f: Preferences & { sharedOnly?: boolean }, myInterests: string[]) {
  if (p.unavailable) return false;
  if (p.age < f.ageMin || p.age > f.ageMax) return false;
  if (p.distanceKm > f.distance) return false;
  if (f.genders.length && !f.genders.includes(GENDER_TO_PREF[p.gender])) return false;
  if (f.intentions.length && !f.intentions.includes(p.intention)) return false;
  if (f.sharedOnly && !p.interests.some((i) => myInterests.includes(i))) return false;
  return true;
}

export function ageFromDob(dob: string, now = new Date()) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 0;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
