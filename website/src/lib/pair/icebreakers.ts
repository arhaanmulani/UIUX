import { z } from "zod";
import type { MyProfile } from "./types";

export const icebreakerProfileSchema = z.object({
  name: z.string().trim().max(80),
  occupation: z.string().max(150),
  intention: z.string().max(80),
  interests: z.array(z.string().max(80)).max(20),
  languages: z.array(z.string().max(80)).max(10),
  prompts: z.array(z.object({ question: z.string().max(200), answer: z.string().max(1000) })).max(3),
});
export const icebreakerInputSchema = z.object({
  profileId: z.string().trim().min(1).max(80),
  conversation: z.string().trim().min(1, "Describe the conversation you'd like.").max(500),
  me: icebreakerProfileSchema,
});
export const icebreakerOutputSchema = z.object({
  suggestions: z.array(z.object({ text: z.string(), connection: z.string() }).strict()),
}).strict();
export type IcebreakerInput = z.infer<typeof icebreakerInputSchema>;
export type IcebreakerSuggestion = z.infer<typeof icebreakerOutputSchema>["suggestions"][number];
export type IcebreakerResult = { suggestions: IcebreakerSuggestion[]; error: string | null; status: number };

export function icebreakerProfile(profile: Pick<MyProfile, "name" | "occupation" | "intention" | "interests" | "languages" | "prompts">) {
  // Do not transmit photos, birthday, email, location, messages, or safety reports.
  return icebreakerProfileSchema.parse({
    name: profile.name.slice(0, 80), occupation: profile.occupation.slice(0, 150),
    intention: profile.intention, interests: profile.interests.slice(0, 20),
    languages: profile.languages.slice(0, 10),
    prompts: profile.prompts.slice(0, 3).map((p) => ({ question: p.question.slice(0, 200), answer: p.answer.slice(0, 1000) })),
  });
}

export function normalizeIcebreakers(value: unknown): IcebreakerSuggestion[] {
  const parsed = icebreakerOutputSchema.parse(value);
  return parsed.suggestions.map((s) => ({ text: s.text.trim().slice(0, 500), connection: s.connection.trim().slice(0, 250) }))
    .filter((s, i, all) => s.text && all.findIndex((other) => other.text === s.text) === i).slice(0, 3);
}