<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## PAIR architecture
- Discover separates opt-in published real profiles from fictional demo profiles; per-match AI conversations remain fictional companions and must never impersonate real daters.
- Icebreakers use client-safe validated profile projections and a TanStack server function importing server-only AI helpers; secrets and prompts must never enter browser code.
- AI calls use Responses streaming with strict structured output, no automatic retries, and a durable service-only denial guard plus atomic request quota because demo sessions are not authentication.
- Suggestions insert into editable drafts, never send automatically, so the dater remains in control.
- Cloud chat uses route-derived match IDs, owned UUID threads, AI SDK UIMessage parts, and an authenticated streaming HTTP endpoint; canonical history is loaded server-side rather than trusted from the browser.
- Compose chat messages, transcript, and composer with installed AI Elements primitives to preserve streaming compatibility and accessible controls.
- Real dater profiles use owner writes and owner-or-published authenticated reads with matching photo access in a private bucket; signed URLs are short-lived so unpublished photos are not permanently public.
- Discover renders the owner's real-profile preview in a separate tab, using owner-scoped reads and signed photo URLs; never insert real profiles into demo likes, matches, or AI companion queues.
- Published discovery reads run through an authenticated server function with explicit projections; they expose neither account emails nor authentication data.
