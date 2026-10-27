import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Icebreakers } from "./Icebreakers";
import { actions, getState } from "@/lib/pair/store";

export function CloudChat({ threadId, matchId, name, initialMessages }: { threadId: string; matchId: string; name: string; initialMessages: UIMessage[] }) {
  const [text, setText] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat", body: { threadId },
    headers: async () => {
      const { data } = await supabase.auth.getSession();
      return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
    },
    prepareSendMessagesRequest: ({ messages, body, headers }) => ({ body: { ...body, messages: messages.filter((m) => m.role !== "system").map((m) => ({ id: m.id, role: m.role, parts: m.parts.filter((p) => p.type === "text") })) }, headers }),
  }), [threadId]);
  const { messages, status, sendMessage, stop, error } = useChat({ id: threadId, messages: initialMessages, transport });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => { setText(getState().drafts[matchId] ?? ""); textarea.current?.focus(); }, [matchId]);
  useEffect(() => { if (!busy && !(document.activeElement instanceof HTMLInputElement)) textarea.current?.focus(); }, [busy]);
  return <>
    <Conversation className="min-h-0 flex-1">
      <ConversationContent className="px-0 py-5">
        {!messages.length && <p className="py-8 text-center text-sm text-muted-foreground">Start a conversation with {name}.</p>}
        {messages.map((m) => <Message key={m.id} from={m.role} className="max-w-full">
          <MessageContent className={m.role === "user" ? "rounded-lg bg-primary text-primary-foreground" : "bg-transparent"}>
            {m.parts.map((part, i) => part.type === "text" ? <MessageResponse key={i}>{part.text}</MessageResponse> : part.type === "reasoning" ? <details key={i} className="mb-2 text-xs text-muted-foreground"><summary>AI thinking</summary><p className="whitespace-pre-wrap">{part.text}</p></details> : null)}
          </MessageContent>
        </Message>)}
        {busy && <div role="status" className="text-sm text-muted-foreground"><Shimmer>{`${name} is thinking…`}</Shimmer></div>}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
    {error && <p role="alert" className="py-3 text-sm text-destructive">{error.message}</p>}
    <PromptInput onSubmit={async () => {
      if (!text.trim() || busy) return;
      const value = text.trim(); setText(""); actions.setDraft(matchId, "");
      textarea.current?.focus();
      await sendMessage({ text: value });
    }}>
      <PromptInputTextarea ref={textarea} aria-label="Message" value={text} maxLength={1000} placeholder={`Message ${name}…`} onChange={(e) => { setText(e.target.value); actions.setDraft(matchId, e.target.value); }} />
      <PromptInputFooter>
        <Icebreakers initialMatchId={matchId} onUse={(value) => { setText(value); requestAnimationFrame(() => textarea.current?.focus()); }} />
        <PromptInputSubmit status={status} disabled={!busy && !text.trim()} onStop={stop} aria-label={busy ? "Stop" : "Send"} />
      </PromptInputFooter>
    </PromptInput>
    <p className="pt-2 text-center text-[11px] text-muted-foreground">AI companion · Fictional profile · Conversations saved privately in Cloud</p>
  </>;
}