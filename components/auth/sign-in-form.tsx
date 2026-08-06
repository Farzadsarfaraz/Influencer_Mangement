"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signInAction } from "@/lib/actions/auth";
import { Reveal } from "@/components/shared/reveal";
import { SignInSplash } from "@/components/shared/sign-in-splash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function SignInForm() {
  const [state, formAction] = useActionState(signInAction, undefined);
  const router = useRouter();

  if (state?.status === "success") {
    return <SignInSplash onFinished={() => router.push(state.redirectTo)} />;
  }

  return (
    <form action={formAction}>
      <Reveal className="space-y-4" stagger={0.08} y={10}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state?.status === "error" ? (
          <p className="text-destructive text-sm">{state.message}</p>
        ) : null}
        <SubmitButton />
      </Reveal>
    </form>
  );
}
