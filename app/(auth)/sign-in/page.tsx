import type { Metadata } from "next";

import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Octagon",
};

export default function SignInPage() {
  return (
    <div className="w-full space-y-1.5 text-center sm:text-left">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-muted-foreground text-sm">
        Agency, brand, and creator accounts all sign in here.
      </p>
      <div className="pt-6">
        <SignInForm />
      </div>
    </div>
  );
}
