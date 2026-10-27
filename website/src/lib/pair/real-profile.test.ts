import { describe, expect, it } from "vitest";
import { discoverableProfile, ownedProfile, type RealProfile } from "./real-profile";

const profile: RealProfile = {
  user_id: "owner", name: "Alex", city: "Brooklyn", bio: "Books, cooking and long walks.",
  interests: ["Books and reading", "Cooking", "Nature"], photos: ["owner/photo.jpg"], updated_at: "2026-10-22T00:00:00Z",
  is_published: false,
};

describe("real profile discovery preview", () => {
  it("returns the owner's saved photos, bio and interests", () => {
    expect(ownedProfile(profile, "owner")).toEqual(profile);
  });
  it("never displays another account's private profile", () => {
    expect(ownedProfile(profile, "other")).toBeNull();
  });
  it("keeps saved profiles private until the owner publishes", () => {
    expect(discoverableProfile(profile, "other")).toBe(false);
  });
  it("shows published profiles to other daters", () => {
    expect(discoverableProfile({ ...profile, is_published: true }, "other")).toBe(true);
  });
  it("keeps the owner's profile out of their discovery list", () => {
    expect(discoverableProfile({ ...profile, is_published: true }, "owner")).toBe(false);
  });
  it("hides a profile again when its owner unpublishes", () => {
    expect(discoverableProfile({ ...profile, is_published: false }, "other")).toBe(false);
  });
});