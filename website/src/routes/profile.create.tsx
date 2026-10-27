import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/pair/Protected";
import { Chip, Field, Logo } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { actions, usePair } from "@/lib/pair/store";
import { PROMPT_QUESTIONS, type MyProfile } from "@/lib/pair/types";

export const Route = createFileRoute("/profile/create")({
  head: () => ({
    meta: [
      { title: "Build your profile — PAIR" },
      { name: "description", content: "Add photos, details and prompts to your PAIR profile." },
      { property: "og:title", content: "Build your profile — PAIR" },
      { property: "og:description", content: "Create a profile that starts real conversations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected shell={false}>
      <Builder />
    </Protected>
  ),
});

const LANGS = ["English", "Spanish", "French", "Italian", "Hindi", "Mandarin", "Portuguese", "German", "Arabic"];

function Builder() {
  const s = usePair();
  const navigate = useNavigate();
  const [me, setMe] = useState<MyProfile>(() => ({
    ...s.me,
    prompts: s.me.prompts.length ? s.me.prompts : [{ question: PROMPT_QUESTIONS[2], answer: "" }, { question: PROMPT_QUESTIONS[0], answer: "" }, { question: PROMPT_QUESTIONS[4], answer: "" }],
  }));
  const [tried, setTried] = useState(false);
  const up = (p: Partial<MyProfile>) => setMe((m) => ({ ...m, ...p }));
  const filled = me.prompts.filter((p) => p.answer.trim());
  const errors = {
    name: !me.name.trim() && "Add your first name",
    city: !me.city.trim() && "Add your city",
    occupation: !me.occupation.trim() && "Add what you do",
    prompts: filled.length < 2 && "Answer at least 2 prompts",
  };
  const valid = !Object.values(errors).some(Boolean);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    Array.from(files).slice(0, 6 - me.photos.length).forEach((f) => {
      if (f.size > 1.5 * 1024 * 1024) { toast.error(`${f.name} is too large (max 1.5 MB)`); return; }
      const r = new FileReader();
      r.onload = () => setMe((m) => ({ ...m, photos: [...m.photos, String(r.result)].slice(0, 6) }));
      r.readAsDataURL(f);
    });
  }

  function save() {
    setTried(true);
    if (!valid) { toast.error("A few details are missing"); return; }
    actions.saveProfile({ ...me, prompts: filled }, true);
    toast.success("Profile saved");
    navigate({ to: "/discover" });
  }

  return (
    <div className="pb-16">
      <Logo />
      <h1 className="mt-10 text-4xl">Your profile</h1>
      <p className="mt-2 text-muted-foreground">Great profiles are specific. Answer prompts the way you'd talk.</p>

      <section className="mt-10">
        <h2 className="text-2xl">Photos</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {me.photos.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt={`Your photo ${i + 1}`} className="aspect-[4/5] w-full rounded-xl object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => up({ photos: me.photos.filter((_, j) => j !== i) })} className="absolute right-2 top-2 rounded-full bg-card p-1 shadow">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {me.photos.length < 6 && (
            <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:border-primary">
              <ImagePlus className="h-6 w-6" /> Add photo
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
            </label>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Photos stay in this browser only (demo).</p>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="name" error={tried ? errors.name || undefined : undefined}><Input id="name" value={me.name} onChange={(e) => up({ name: e.target.value })} /></Field>
        <Field label="City" htmlFor="city" error={tried ? errors.city || undefined : undefined}><Input id="city" value={me.city} onChange={(e) => up({ city: e.target.value })} /></Field>
        <Field label="Pronouns" htmlFor="pron"><Input id="pron" value={me.pronouns} placeholder="optional" onChange={(e) => up({ pronouns: e.target.value })} /></Field>
        <Field label="Occupation" htmlFor="occ" error={tried ? errors.occupation || undefined : undefined}><Input id="occ" value={me.occupation} onChange={(e) => up({ occupation: e.target.value })} /></Field>
        <Field label="Education" htmlFor="edu"><Input id="edu" value={me.education} placeholder="optional" onChange={(e) => up({ education: e.target.value })} /></Field>
      </section>

      <section className="mt-8">
        <p className="text-sm font-semibold">Languages</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <Chip key={l} selected={me.languages.includes(l)} onClick={() => up({ languages: me.languages.includes(l) ? me.languages.filter((x) => x !== l) : [...me.languages, l] })}>{l}</Chip>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="text-2xl">Prompts</h2>
        {tried && errors.prompts && <p role="alert" className="text-sm text-destructive">{errors.prompts}</p>}
        {me.prompts.map((p, i) => (
          <div key={i} className="card-surface space-y-3 p-5">
            <select
              aria-label={`Prompt ${i + 1} question`}
              value={p.question}
              onChange={(e) => up({ prompts: me.prompts.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)) })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold"
            >
              {PROMPT_QUESTIONS.map((q) => <option key={q}>{q}</option>)}
            </select>
            <Textarea
              aria-label={`Prompt ${i + 1} answer`}
              maxLength={200}
              value={p.answer}
              placeholder="Your answer…"
              onChange={(e) => up({ prompts: me.prompts.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)) })}
            />
            <p className="text-right text-xs text-muted-foreground">{p.answer.length}/200</p>
          </div>
        ))}
      </section>

      <div className="mt-10 flex justify-end">
        <Button size="lg" onClick={save}>Save profile</Button>
      </div>
    </div>
  );
}
