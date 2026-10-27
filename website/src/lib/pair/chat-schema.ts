import { z } from "zod";
import { icebreakerProfileSchema } from "./icebreakers";

export const openChatSchema = z.object({ matchId: z.string().min(1).max(80), profileId: z.string().min(1).max(80), dater: icebreakerProfileSchema });
export const sendChatSchema = z.object({
  threadId: z.string().uuid(),
  messages: z.array(z.object({ id: z.string().min(1).max(150), role: z.enum(["user", "assistant"]), parts: z.array(z.object({ type: z.literal("text"), text: z.string().min(1).max(1000) })).length(1) })).min(1).max(100),
});
export function storedMessage(row: { message_key: string; role: string; parts: unknown }) {
  const parts = z.array(z.object({ type: z.enum(["text", "reasoning"]), text: z.string() })).parse(row.parts);
  return { id: row.message_key, role: row.role === "user" ? "user" as const : "assistant" as const, parts };
}