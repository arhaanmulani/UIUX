import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./primitives";

export function useCloudAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) { setUser(data.session?.user ?? null); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setReady(true); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  return { user, ready };
}

export function CloudAccount({ profiles = false }: { profiles?: boolean }) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function submit() {
    setBusy(true); setNotice("");
    try {
      const result = signup ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + window.location.pathname } }) : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setNotice(result.error.message);
      else if (signup && !result.data.session) setNotice("Check your email to confirm your account, then sign in here.");
    } finally { setBusy(false); }
  }
  async function social(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + window.location.pathname });
    if (result.error) setNotice(result.error.message);
  }
  return <section className="mx-auto w-full max-w-sm py-10">
    <h2 className="font-display text-2xl">{profiles ? "Your PAIR account" : "Keep your conversations"}</h2>
    <p className="mt-2 mb-6 text-sm text-muted-foreground">{profiles ? "Sign in to manage your profile and see real daters who have chosen to publish." : "Sign in to save private conversations with AI companions. These are fictional matches, not real daters."}</p>
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Cloud email" htmlFor="cloud-email"><Input id="cloud-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Cloud password" htmlFor="cloud-password"><Input id="cloud-password" type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Please wait…" : signup ? "Create Cloud account" : "Sign in to Cloud"}</Button>
      <Button type="button" variant="link" onClick={() => { setSignup(!signup); setNotice(""); }}>{signup ? "Already have an account? Sign in" : "Create a Cloud account"}</Button>
    </form>
    <div className="mt-4 space-y-2">
      <Button variant="outline" className="w-full" onClick={() => social("google")}>Continue with Google</Button>
      <Button className="lovable-auth-button w-full" onClick={() => social("lovable")}>Continue with Lovable</Button>
    </div>
    {notice && <p role="alert" className="mt-4 text-sm text-muted-foreground">{notice}</p>}
  </section>;
}