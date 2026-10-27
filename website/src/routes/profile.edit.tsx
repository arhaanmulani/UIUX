import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CloudAccount, useCloudAccount } from "@/components/pair/CloudAccount";
import { Chip, Field, Logo } from "@/components/pair/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INTERESTS } from "@/lib/pair/types";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({
    meta: [
      { title: "Your real profile — PAIR" },
      { name: "description", content: "Create your own PAIR dating profile with photos, a bio and interests." },
      { property: "og:title", content: "Your real profile — PAIR" },
      { property: "og:description", content: "Add your photos, bio and interests to PAIR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileEditPage,
});

const BUCKET = "dater-photos";
const MAX_PHOTOS = 6;

type Photo = { path: string; url: string };

function ProfileEditPage() {
  const account = useCloudAccount();
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 pb-20">
      <div className="flex items-center justify-between"><Logo /><Link to="/discover" className="text-sm text-muted-foreground hover:text-primary">Back to app</Link></div>
      <h1 className="mt-10 text-4xl">Your real profile</h1>
      <p className="mt-2 text-muted-foreground">This is you — not a demo. Private until you choose to publish.</p>
      <div className="mt-8">
        {!account.ready ? <p role="status">Loading account…</p> : !account.user ? <CloudAccount profiles /> : <Editor key={account.user.id} userId={account.user.id} />}
      </div>
    </div>
  );
}

function Editor({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [published, setPublished] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("dater_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (error) { toast.error("Couldn't load your profile"); setLoadFailed(true); }
      if (data) {
        setPublished(data.is_published);
        setName(data.name); setCity(data.city); setBio(data.bio); setInterests(data.interests);
        if (data.photos.length) {
          const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(data.photos, 3600);
          setPhotos(data.photos.map((path, i) => ({ path, url: signed?.[i]?.signedUrl ?? "" })));
        }
      }
      setLoading(false);
    })();
  }, [userId]);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    for (const f of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} isn't an image`); continue; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} is too large (max 5 MB)`); continue; }
      const path = `${userId}/${crypto.randomUUID()}.${f.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
      if (error) { toast.error(`Couldn't upload ${f.name}`); continue; }
      setPhotos((p) => [...p, { path, url: URL.createObjectURL(f) }]);
    }
    setUploading(false);
  }

  async function removePhoto(path: string) {
    setPhotos((p) => p.filter((x) => x.path !== path));
    await supabase.storage.from(BUCKET).remove([path]);
  }

  const errors = {
    name: !name.trim() && "Add your first name",
    city: !city.trim() && "Add your city",
    bio: bio.trim().length < 20 && "Write at least 20 characters",
    interests: interests.length < 3 && "Pick at least 3 interests",
    photos: photos.length < 1 && "Add at least one photo",
  };

  async function save(visibility = published) {
    setTried(true);
    if (Object.values(errors).some(Boolean)) { toast.error("A few details are missing"); return; }
    setSaving(true);
    const { error } = await supabase.from("dater_profiles").upsert({
      user_id: userId, name: name.trim(), city: city.trim(), bio: bio.trim(), interests,
      photos: photos.map((p) => p.path), updated_at: new Date().toISOString(),
      is_published: visibility,
    });
    setSaving(false);
    if (error) toast.error("Couldn't save your profile. Please try again.");
    else {
      setPublished(visibility);
      void queryClient.invalidateQueries({ queryKey: ["real-profile-preview", userId] });
      void queryClient.invalidateQueries({ queryKey: ["real-discovery"] });
      toast.success(visibility ? "Profile published in Discover" : "Profile saved privately");
    }
  }

  async function unpublish() {
    setSaving(true);
    const { error } = await supabase.from("dater_profiles").update({ is_published: false }).eq("user_id", userId);
    setSaving(false);
    if (error) { toast.error("Couldn't hide your profile. Please try again."); return; }
    setPublished(false);
    void queryClient.invalidateQueries({ queryKey: ["real-profile-preview", userId] });
    void queryClient.invalidateQueries({ queryKey: ["real-discovery"] });
    toast.success("Profile hidden from Discover");
  }

  if (loading) return <p role="status">Loading your profile…</p>;
  if (loadFailed) return <p role="alert" className="text-destructive">Couldn't load your saved profile. Reload this page to try again.</p>;
  const err = (e: string | false) => (tried && e ? e : undefined);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl">Photos</h2>
        {err(errors.photos) && <p role="alert" className="mt-2 text-sm text-destructive">{errors.photos}</p>}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={p.path} className="relative">
              <img src={p.url} alt={`Your photo ${i + 1}`} className="aspect-[4/5] w-full rounded-xl object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => removePhoto(p.path)} className="absolute right-2 top-2 rounded-full bg-card p-1 shadow"><X className="h-4 w-4" /></button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:border-primary">
              <ImagePlus className="h-6 w-6" /> {uploading ? "Uploading…" : "Add photo"}
              <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Up to 6 photos, 5 MB each.</p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="name" error={err(errors.name)}><Input id="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="City" htmlFor="city" error={err(errors.city)}><Input id="city" maxLength={80} value={city} onChange={(e) => setCity(e.target.value)} /></Field>
      </section>

      <section>
        <Field label="Bio" htmlFor="bio" error={err(errors.bio)}>
          <Textarea id="bio" rows={5} maxLength={500} value={bio} placeholder="What should someone know about you?" onChange={(e) => setBio(e.target.value)} />
        </Field>
        <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/500</p>
      </section>

      <section>
        <h2 className="text-2xl">Interests</h2>
        {err(errors.interests) && <p role="alert" className="mt-2 text-sm text-destructive">{errors.interests}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <Chip key={i} selected={interests.includes(i)} onClick={() => setInterests((x) => x.includes(i) ? x.filter((y) => y !== i) : [...x, i])}>{i}</Chip>
          ))}
        </div>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-2xl">Discover visibility</h2>
        <p className="text-sm text-muted-foreground">{published ? "Your photos, first name, city, bio and interests are visible to other signed-in daters." : "Your profile is private. Publishing shares your photos, first name, city, bio and interests with other signed-in daters."}</p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" variant="outline" onClick={() => save()} disabled={saving || uploading}>{saving ? "Saving…" : "Save profile"}</Button>
          {published ? <Button variant="outline" onClick={unpublish} disabled={saving || uploading}>Hide from Discover</Button> : <Button size="lg" onClick={() => save(true)} disabled={saving || uploading}>Publish in Discover</Button>}
        </div>
      </section>
    </div>
  );
}
