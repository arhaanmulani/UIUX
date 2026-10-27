import { describe, expect, it } from "vitest";
import { ageFromDob, compatibility, matchesFilters } from "./compatibility";
import { DEMO_PROFILES } from "./seed";

const maya = DEMO_PROFILES.find((p) => p.id === "maya")!;
const elena = DEMO_PROFILES.find((p) => p.id === "elena")!;

describe("compatibility", () => {
  it("scores 2 per shared interest plus 3 for matching intention", () => {
    const r = compatibility({ interests: ["Travel", "Nature"], intention: "long-term", languages: [] }, maya);
    expect(r.score).toBe(7);
    expect(r.reasons).toContain("You both enjoy travel.");
  });
});

describe("filters", () => {
  const base = { genders: [], ageMin: 18, ageMax: 99, distance: 50, intentions: [] };
  it("excludes profiles outside the age range", () => {
    expect(matchesFilters(maya, { ...base, ageMin: 30 }, [])).toBe(false);
  });
  it("never shows unavailable profiles", () => {
    expect(matchesFilters(elena, base, [])).toBe(false);
  });
});

describe("age", () => {
  it("requires turning 18 on the birthday", () => {
    expect(ageFromDob("2008-10-19", new Date("2026-10-18"))).toBe(17);
    expect(ageFromDob("2008-10-18", new Date("2026-10-18"))).toBe(18);
  });
});
