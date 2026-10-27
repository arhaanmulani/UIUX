import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/pair/AuthLayout";
import { Field } from "@/components/pair/primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { actions } from "@/lib/pair/store";
import { ageFromDob } from "@/lib/pair/compatibility";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Join PAIR — Create your account" },
      { name: "description", content: "Create your PAIR account and start meeting people who make sense for you." },
      { property: "og:title", content: "Join PAIR" },
      { property: "og:description", content: "Less swiping. More meaning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Signup,
});

const schema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name").max(40),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Za-z]/, "Include at least one letter")
    .regex(/\d/, "Include at least one number"),
  dob: z.string().min(1, "Enter your date of birth").refine((v) => ageFromDob(v) >= 18, "You must be 18 or older to join PAIR"),
  agree: z.literal(true, { errorMap: () => ({ message: "Please accept the Terms and Privacy Policy" }) }),
});
type Values = z.infer<typeof schema>;

function Signup() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, setValue, watch, formState } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });
  const e = formState.errors;

  async function onSubmit(v: Values) {
    await new Promise((r) => setTimeout(r, 500));
    actions.signUp({ firstName: v.firstName, email: v.email, dob: v.dob });
    toast.success(`Welcome to PAIR, ${v.firstName}`);
    navigate({ to: "/onboarding" });
  }

  return (
    <AuthLayout title="Join PAIR" subtitle="Meet people who make sense for you.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="First name" htmlFor="firstName" error={e.firstName?.message}>
          <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
        </Field>
        <Field label="Email address" htmlFor="email" error={e.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={e.password?.message} hint="8+ characters with a letter and a number">
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="new-password" {...register("password")} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="Date of birth" htmlFor="dob" error={e.dob?.message}>
          <Input id="dob" type="date" {...register("dob")} />
        </Field>
        <div className="space-y-1">
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={!!watch("agree")} onCheckedChange={(c) => setValue("agree", (c === true) as true, { shouldValidate: true })} className="mt-0.5" />
            <span>I agree to the Terms of Service and Privacy Policy.</span>
          </label>
          {e.agree && <p role="alert" className="text-xs text-destructive">{e.agree.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting && <Loader2 className="animate-spin" />} Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-semibold text-primary">Sign In</Link>
      </p>
    </AuthLayout>
  );
}
