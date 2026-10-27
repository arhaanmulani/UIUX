import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { openChatSchema, storedMessage } from "./chat-schema";
import { getProfile } from "./seed";

export const openCloudChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => openChatSchema.parse(input))
  .handler(async ({ data, context }) => {
    const profile = getProfile(data.profileId);
    if (!profile || profile.unavailable || data.matchId !== `m-${profile.id}`) throw new Error("Conversation not available.");
    const thread = await context.supabase.from("pair_chat_threads").upsert({ user_id: context.userId, match_id: data.matchId, profile_id: data.profileId, dater: data.dater }, { onConflict: "user_id,match_id" }).select("id").single();
    if (thread.error) throw new Error("Your conversation could not be opened.");
    const history = await context.supabase.from("pair_chat_messages").select("message_key,role,parts").eq("thread_id", thread.data.id).order("created_at", { ascending: true });
    if (history.error) throw new Error("Your saved messages could not be loaded.");
    return { id: thread.data.id, messages: history.data.map(storedMessage) };
  });

export const listCloudChats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const rows = await context.supabase.from("pair_chat_threads").select("id,match_id,pair_chat_messages(message_key,role,parts,created_at)");
    if (rows.error) throw new Error("Saved conversations could not be loaded.");
    return rows.data.map((row) => {
      const sorted = row.pair_chat_messages.sort((a, b) => a.created_at.localeCompare(b.created_at));
      const last = sorted.at(-1);
      return { matchId: row.match_id, text: last ? storedMessage(last).parts.filter((p) => p.type === "text").map((p) => p.text).join("") : "", at: last?.created_at ?? null };
    });
  });