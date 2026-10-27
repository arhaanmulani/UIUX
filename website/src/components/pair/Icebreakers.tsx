import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { actions, usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";
import { icebreakerProfile, type IcebreakerSuggestion } from "@/lib/pair/icebreakers";
import { suggestIcebreakers } from "@/lib/pair/icebreakers.functions";
import { Field } from "./primitives";

export function Icebreakers({ initialMatchId, onUse }: { initialMatchId?: string; onUse?: (text: string) => void }) {
  const state = usePair();
  const navigate = useNavigate();
  const generate = useServerFn(suggestIcebreakers);
  const [open, setOpen] = useState(false);
  const [matchId, setMatchId] = useState(initialMatchId ?? "");
  const [conversation, setConversation] = useState("");
  const [suggestions, setSuggestions] = useState<IcebreakerSuggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [terminal, setTerminal] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const candidates = state.matches.filter((m) => {
    const p = getProfile(m.profileId);
    return !m.archived && p && !p.unavailable && !state.blocks.includes(p.id);
  });
  const selected = candidates.find((m) => m.id === matchId);

  function changeOpen(value: boolean) {
    if (!value) controller.current?.abort();
    else if (!matchId && candidates[0]) setMatchId(candidates[0].id);
    setOpen(value);
  }

  async function requestSuggestions() {
    if (!selected || !conversation.trim() || busy || terminal) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true); setError(""); setSuggestions([]);
    try {
      const result = await generate({ data: { profileId: selected.profileId, conversation, me: icebreakerProfile(state.me) }, signal: abort.signal });
      if (abort.signal.aborted) return;
      if (result.error) {
        setError(result.error);
        setTerminal([401, 403, 404].includes(result.status));
      } else setSuggestions(result.suggestions);
    } catch (e) {
      if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Suggestions could not be generated. Please try again later.");
    } finally {
      if (controller.current === abort) { controller.current = null; setBusy(false); }
    }
  }

  function useSuggestion(text: string) {
    if (!selected) return;
    actions.setDraft(matchId, text);
    changeOpen(false);
    if (onUse && matchId === initialMatchId) onUse(text);
    else navigate({ to: "/chat/$matchId", params: { matchId } });
  }

  return (
    <>
      <Button variant="soft" size="sm" onClick={() => changeOpen(true)} disabled={!candidates.length}>
        <Sparkles className="h-4 w-4" /> Icebreakers
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>A thoughtful first message</DialogTitle>
            <DialogDescription>AI-powered · Personalized to both profiles</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Your match" htmlFor="icebreaker-match">
              <Select value={matchId} disabled={busy} onValueChange={(value) => { setMatchId(value); setSuggestions([]); setError(""); }}>
                <SelectTrigger id="icebreaker-match"><SelectValue placeholder="Select a match" /></SelectTrigger>
                <SelectContent>{candidates.map((m) => <SelectItem key={m.id} value={m.id}>{getProfile(m.profileId)?.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="What kind of conversation do you want?" htmlFor="icebreaker-intent">
              <Textarea id="icebreaker-intent" value={conversation} disabled={busy} maxLength={500} rows={3}
                placeholder="Something playful about our love of cooking, with a question that's easy to answer…"
                onChange={(e) => { setConversation(e.target.value); setSuggestions([]); setError(""); }} />
            </Field>
            <p className="text-xs text-muted-foreground">Your profile interests, prompts, and conversation preference are shared with Lovable AI. Photos and chat history are not.</p>
            {busy ? (
              <div className="flex items-center justify-between gap-3" role="status">
                <span className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 motion-safe:animate-spin" /> Finding your common ground…</span>
                <Button variant="outline" size="sm" onClick={() => controller.current?.abort()}>Stop</Button>
              </div>
            ) : (
              <Button className="w-full" onClick={requestSuggestions} disabled={!selected || !conversation.trim() || terminal}>
                {suggestions.length ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {suggestions.length ? "Generate again" : "Suggest icebreakers"}
              </Button>
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {suggestions.length > 0 && <ol className="space-y-3" aria-label="Icebreaker suggestions">{suggestions.map((suggestion, i) => (
              <li key={i} className="rounded-lg border border-border bg-card p-4">
                <p className="whitespace-pre-wrap break-words text-sm">{suggestion.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{suggestion.connection}</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => useSuggestion(suggestion.text)}>Use this message <ArrowUpRight className="h-4 w-4" /></Button>
              </li>
            ))}</ol>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}