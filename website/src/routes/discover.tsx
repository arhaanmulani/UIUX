import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Protected } from "@/components/pair/Protected";
import { ProfileView } from "@/components/pair/ProfileView";
import { Chip, EmptyState, PageHeader } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { actions, usePair } from "@/lib/pair/store";
import { DEMO_PROFILES } from "@/lib/pair/seed";
import { compatibility, matchesFilters } from "@/lib/pair/compatibility";
import { GENDERS, type GenderPref } from "@/lib/pair/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealProfilePreview } from "@/components/pair/RealProfilePreview";
import { RealDiscovery } from "@/components/pair/RealDiscovery";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — PAIR" },
       { name: "description", content: "Discover published PAIR profiles and manage your own profile visibility." },
      { property: "og:title", content: "Discover — PAIR" },
       { property: "og:description", content: "Browse real profiles published by signed-in PAIR daters, separately from fictional demos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Protected>
      <Discover />
    </Protected>
  ),
});

function Discover() {
  const s = usePair();
  const [open, setOpen] = useState(false);
  const f = s.filters;
  const hidden = new Set([...s.passes, ...s.blocks, ...s.likesSent.map((l) => l.profileId), ...s.matches.map((m) => m.profileId)]);
  const queue = DEMO_PROFILES.filter((p) => !hidden.has(p.id) && matchesFilters(p, f, s.me.interests)).sort(
    (a, b) => compatibility(s.me, b).score - compatibility(s.me, a).score,
  );
  const current = queue[0];

  return (
    <>
      <PageHeader
        eyebrow="People & connections"
        title="Discover"
        actions={
          <>
            {s.lastPass && (
              <Button variant="outline" onClick={() => actions.undoPass()}><RotateCcw className="h-4 w-4" /> Undo</Button>
            )}
            <Button variant="outline" onClick={() => setOpen(true)}><SlidersHorizontal className="h-4 w-4" /> Filters</Button>
          </>
        }
      />
      <Tabs defaultValue="daters" className="w-full">
        <TabsList className="mb-6 h-auto flex-wrap" aria-label="Discover profiles">
          <TabsTrigger value="daters">Real daters</TabsTrigger>
          <TabsTrigger value="real">My real profile</TabsTrigger>
          <TabsTrigger value="demo">Demo profiles</TabsTrigger>
        </TabsList>
        <TabsContent value="daters"><RealDiscovery /></TabsContent>
        <TabsContent value="real"><RealProfilePreview /></TabsContent>
        <TabsContent value="demo">
      {s.settings.paused && (
        <p className="mb-6 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">Your profile is paused — others can't see you. <Link to="/settings" className="font-semibold underline">Resume</Link></p>
      )}
      {current ? (
        <ProfileView key={current.id} profile={current} />
      ) : (
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="You're all caught up"
          body="Try widening your filters or revisit the people you passed on."
          action={
            <>
              <Button variant="outline" onClick={() => setOpen(true)}>Adjust filters</Button>
              {s.passes.length > 0 && <Button onClick={() => actions.clearPasses()}>Show passed profiles</Button>}
            </>
          }
        />
      )}
        </TabsContent>
      </Tabs>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
          <div className="space-y-8 px-4 py-6">
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip
                  key={g}
                  selected={f.genders.includes(g)}
                  onClick={() => actions.setFilters({ ...f, genders: f.genders.includes(g) ? f.genders.filter((x) => x !== g) : [...f.genders, g as GenderPref] })}
                >{g}</Chip>
              ))}
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Age: {f.ageMin}–{f.ageMax}</p>
              <Slider min={18} max={70} value={[f.ageMin, f.ageMax]} onValueChange={([a, b]) => actions.setFilters({ ...f, ageMin: a, ageMax: b })} aria-label="Age range" />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Within {f.distance} km</p>
              <Slider min={2} max={100} value={[f.distance]} onValueChange={([d]) => actions.setFilters({ ...f, distance: d })} aria-label="Distance" />
            </div>
            <label className="flex items-center justify-between text-sm font-semibold">
              Shared interests only
              <Switch checked={f.sharedOnly} onCheckedChange={(v) => actions.setFilters({ ...f, sharedOnly: v })} />
            </label>
            <Button variant="outline" className="w-full" onClick={() => actions.resetFilters()}>Reset to my preferences</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
