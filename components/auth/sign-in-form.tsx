"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

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

  useEffect(() => {
    if (state?.status === "error") {
      toast.error("Sign-in failed", { description: state.message });
    }
  }, [state]);

  if (state?.status === "success") {
    return (
      <SignInSplash
        isReturning={state.isReturning}
        onFinished={() => router.push(state.redirectTo)}
      />
    );
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
        <SubmitButton />
      </Reveal>
    </form>
  );
}
