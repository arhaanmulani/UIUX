import { describe, expect, it } from "vitest";
import { sendChatSchema, storedMessage } from "./chat-schema";
describe("Cloud chat", () => {
  it("rejects non-UUID threads and messages beyond the existing 1000 character limit", () => {
    const input = { threadId: "00000000-0000-4000-8000-000000000001", messages: [{ id: "msg_1", role: "user", parts: [{ type: "text", text: "a".repeat(1000) }] }] };
    expect(sendChatSchema.safeParse(input).success).toBe(true);
    expect(sendChatSchema.safeParse({ ...input, threadId: "m-maya" }).success).toBe(false);
    expect(sendChatSchema.safeParse({ ...input, messages: [{ ...input.messages[0], parts: [{ type: "text", text: "a".repeat(1001) }] }] }).success).toBe(false);
  });
  it("restores message parts and independent SDK IDs", () => {
    expect(storedMessage({ message_key: "msg_saved", role: "assistant", parts: [{ type: "text", text: "Hello Alex" }] })).toEqual({ id: "msg_saved", role: "assistant", parts: [{ type: "text", text: "Hello Alex" }] });
  });
});