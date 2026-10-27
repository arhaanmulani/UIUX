import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Protected } from "@/components/pair/Protected";
import { Chip, Logo } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { actions } from "@/lib/pair/store";
import { GENDERS, INTERESTS, INTENTION_LABEL, type Gender, type GenderPref, type Intention } from "@/lib/pair/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — PAIR" },
      { name: "description", content: "Tell PAIR who you are and what you're looking for." },
      { property: "og:title", content: "Get started — PAIR" },
      { property: "og:description", content: "Set your intentions and preferences on PAIR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected shell={false}>
      <Onboarding />
    </Protected>
  ),
});

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | "">("");
  const [intention, setIntention] = useState<Intention | "">("");
  const [genders, setGenders] = useState<GenderPref[]>([]);
  const [age, setAge] = useState([24, 38]);
  const [distance, setDistance] = useState([25]);
  const [interests, setInterests] = useState<string[]>([]);

  const steps = [
    {
      title: "How do you identify?",
      ok: !!gender,
      body: (
        <div className="flex flex-wrap gap-2">
          {(["Woman", "Man", "Non-binary"] as Gender[]).map((g) => (
            <Chip key={g} selected={gender === g} onClick={() => setGender(g)}>{g}</Chip>
          ))}
        </div>
      ),
    },
    {
      title: "What are you looking for?",
      ok: !!intention,
      body: (
        <div className="grid gap-2">
          {(Object.keys(INTENTION_LABEL) as Intention[]).map((i) => (
            <Chip key={i} selected={intention === i} onClick={() => setIntention(i)}>{INTENTION_LABEL[i]}</Chip>
          ))}
        </div>
      ),
    },
    {
      title: "Who would you like to meet?",
      ok: genders.length > 0,
      body: (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <Chip key={g} selected={genders.includes(g)} onClick={() => setGenders(toggle(genders, g))}>{g}</Chip>
            ))}
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Age: {age[0]}–{age[1]}</p>
            <Slider min={18} max={70} step={1} value={age} onValueChange={setAge} aria-label="Age range" />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Within {distance[0]} km</p>
            <Slider min={2} max={100} step={1} value={distance} onValueChange={setDistance} aria-label="Distance" />
          </div>
        </div>
      ),
    },
    {
      title: "Pick at least 3 interests",
      ok: interests.length >= 3,
      body: (
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <Chip key={i} selected={interests.includes(i)} onClick={() => setInterests(toggle(interests, i))}>{i}</Chip>
          ))}
        </div>
      ),
    },
  ];
  const cur = steps[step];

  function next() {
    if (step < steps.length - 1) return setStep(step + 1);
    actions.completeOnboarding(
      { gender, intention, interests },
      { genders, ageMin: age[0], ageMax: age[1], distance: distance[0], intentions: [] },
    );
    navigate({ to: "/profile/create" });
  }

  return (
    <div>
      <Logo />
      <p className="eyebrow mt-10">Step {step + 1} of {steps.length}</p>
      <div className="mt-3 h-1 rounded-full bg-secondary">
        <div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <h1 className="mt-8 text-4xl">{cur.title}</h1>
      <div className="mt-8">{cur.body}</div>
      <div className="mt-10 flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <Button disabled={!cur.ok} onClick={next}>{step === steps.length - 1 ? "Build my profile" : "Continue"}</Button>
      </div>
    </div>
  );
}
