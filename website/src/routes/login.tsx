import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/pair/AuthLayout";
import { Field } from "@/components/pair/primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { actions, getState } from "@/lib/pair/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — PAIR" },
      { name: "description", content: "Sign in to PAIR to see your matches, messages and upcoming dates." },
      { property: "og:title", content: "Sign in to PAIR" },
      { property: "og:description", content: "Less swiping. More meaning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

function nextRoute() {
  const u = getState().user;
  if (!u?.onboarded) return "/onboarding" as const;
  if (!u.profileComplete) return "/profile/create" as const;
  return "/discover" as const;
}

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  async function onSubmit(v: z.infer<typeof schema>) {
    await new Promise((r) => setTimeout(r, 400));
    actions.signIn(v.email);
    navigate({ to: nextRoute() });
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Pick up where you left off.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email address" htmlFor="email" error={formState.errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={formState.errors.password?.message}>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" {...register("password")} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <button type="button" onClick={() => { setForgot(true); setResetSent(false); }} className="text-sm font-semibold text-primary">Forgot password?</button>
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting && <Loader2 className="animate-spin" />} Sign In
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <Button variant="outline" className="w-full" onClick={() => { actions.enterDemo(); navigate({ to: "/discover" }); }}>
        Explore with a demo account
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to PAIR? <Link to="/signup" className="font-semibold text-primary">Create an account</Link>
      </p>

      <Dialog open={forgot} onOpenChange={setForgot}>
        <DialogContent className="rounded-[var(--radius)]">
          {resetSent ? (
            <div className="text-center">
              <MailCheck className="mx-auto h-10 w-10 text-success" />
              <DialogHeader>
                <DialogTitle className="mt-3 text-center font-display text-2xl font-normal">Check your inbox</DialogTitle>
                <DialogDescription className="text-center">If an account exists for {resetEmail}, we've sent a reset link. (Demo mode: no email is actually sent.)</DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (/\S+@\S+\.\S+/.test(resetEmail)) setResetSent(true); }} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-normal">Reset your password</DialogTitle>
                <DialogDescription>Enter your email and we'll send you a link to set a new password.</DialogDescription>
              </DialogHeader>
              <Input type="email" aria-label="Email address" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" />
              <Button type="submit" className="w-full" disabled={!/\S+@\S+\.\S+/.test(resetEmail)}>Send reset link</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
