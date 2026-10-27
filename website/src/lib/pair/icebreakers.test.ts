import { describe, expect, it } from "vitest";
import { icebreakerInputSchema, icebreakerProfile, normalizeIcebreakers } from "./icebreakers";

const profile = { name: "Alex", occupation: "Researcher", intention: "long-term" as const, interests: ["Cooking"], languages: ["English"], prompts: [{ question: "Sunday?", answer: "Farmers market" }], dob: "1995-04-12", photos: ["private-photo"], email: "private@example.test", city: "Brooklyn" };

describe("icebreaker inputs", () => {
  it("sends profile context without private photos, birthday, email or location", () => {
    const result = icebreakerProfile(profile);
    expect(result).toEqual({ name: "Alex", occupation: "Researcher", intention: "long-term", interests: ["Cooking"], languages: ["English"], prompts: [{ question: "Sunday?", answer: "Farmers market" }] });
  });
  it("requires a selected profile and a nonempty conversation preference", () => {
    expect(icebreakerInputSchema.safeParse({ profileId: "", conversation: "playful", me: profile }).success).toBe(false);
    expect(icebreakerInputSchema.safeParse({ profileId: "maya", conversation: "  ", me: profile }).success).toBe(false);
    expect(icebreakerInputSchema.parse({ profileId: "maya", conversation: " playful ", me: profile }).conversation).toBe("playful");
  });
});
describe("icebreaker output", () => {
  it("keeps three unique usable suggestions and discards blanks", () => {
    const suggestions = [" ", "Hello", "Hello", "Second", "Third", "Fourth"].map((text) => ({ text, connection: "Cooking" }));
    expect(normalizeIcebreakers({ suggestions }).map((s) => s.text)).toEqual(["Hello", "Second", "Third"]);
  });
  it("rejects malformed suggestions rather than presenting a fake success", () => {
    expect(() => normalizeIcebreakers({ suggestions: [{ text: 7 }] })).toThrow();
  });
});