import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Protected } from "@/components/pair/Protected";
import { Chip, PageHeader } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { actions, usePair } from "@/lib/pair/store";
import { getProfile } from "@/lib/pair/seed";
import { GENDERS, INTENTION_LABEL, type Intention, type Settings as S } from "@/lib/pair/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PAIR" },
      { name: "description", content: "Manage notifications, privacy and preferences on PAIR." },
      { property: "og:title", content: "Settings — PAIR" },
      { property: "og:description", content: "Control your PAIR account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <SettingsPage />
    </Protected>
  ),
});

const TOGGLES: [keyof S, string, string][] = [
  ["notifyMatches", "New matches", "Notifications"],
  ["notifyMessages", "New messages", "Notifications"],
  ["notifyDates", "Date reminders", "Notifications"],
  ["showAge", "Show my age", "Privacy"],
  ["showDistance", "Show my distance", "Privacy"],
  ["paused", "Pause my profile", "Privacy"],
];

function SettingsPage() {
  const s = usePair();
  const navigate = useNavigate();
  const p = s.prefs;

  return (
    <>
      <PageHeader title="Settings" body={s.user?.email} />
      <div className="space-y-6">
        {["Notifications", "Privacy"].map((group) => (
          <section key={group} className="card-surface divide-y divide-border">
            <h2 className="px-6 py-4 text-xl">{group}</h2>
            {TOGGLES.filter((t) => t[2] === group).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between px-6 py-4 text-sm">
                {label}
                <Switch checked={s.settings[k]} onCheckedChange={(v) => actions.updateSettings({ [k]: v })} />
              </label>
            ))}
          </section>
        ))}

        <section className="card-surface space-y-6 p-6">
          <h2 className="text-xl">Dating preferences</h2>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <Chip key={g} selected={p.genders.includes(g)} onClick={() => actions.updatePrefs({ ...p, genders: p.genders.includes(g) ? p.genders.filter((x) => x !== g) : [...p.genders, g] })}>{g}</Chip>
            ))}
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Age: {p.ageMin}–{p.ageMax}</p>
            <Slider min={18} max={70} value={[p.ageMin, p.ageMax]} onValueChange={([a, b]) => actions.updatePrefs({ ...p, ageMin: a, ageMax: b })} aria-label="Age range" />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Within {p.distance} km</p>
            <Slider min={2} max={100} value={[p.distance]} onValueChange={([d]) => actions.updatePrefs({ ...p, distance: d })} aria-label="Distance" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Only show people looking for (none = everyone)</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(INTENTION_LABEL) as Intention[]).map((i) => (
                <Chip key={i} selected={p.intentions.includes(i)} onClick={() => actions.updatePrefs({ ...p, intentions: p.intentions.includes(i) ? p.intentions.filter((x) => x !== i) : [...p.intentions, i] })}>{INTENTION_LABEL[i]}</Chip>
              ))}
            </div>
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="text-xl">Blocked</h2>
          {s.blocks.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">You haven't blocked anyone.</p> : (
            <ul className="mt-3 space-y-2">
              {s.blocks.map((b) => (
                <li key={b} className="flex items-center justify-between text-sm">
                  {getProfile(b)?.name ?? b}
                  <Button size="sm" variant="ghost" onClick={() => actions.unblock(b)}>Unblock</Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-surface flex flex-wrap gap-2 p-6">
          <Button variant="outline" asChild><Link to="/profile/create">Edit profile</Link></Button>
          <Button variant="outline" asChild><Link to="/safety">Safety Center</Link></Button>
          <Button variant="outline" onClick={() => { actions.signOut(); navigate({ to: "/" }); }}>Sign out</Button>
          <Button variant="outline" onClick={() => { actions.resetDemo(); toast("Demo data reset"); navigate({ to: "/onboarding" }); }}>Reset demo</Button>
          <Button variant="destructive" onClick={() => { if (confirm("Delete your account and all data in this browser?")) { actions.deleteAccount(); navigate({ to: "/" }); } }}>Delete account</Button>
        </section>
      </div>
    </>
  );
}
