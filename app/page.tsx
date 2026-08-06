import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { portalForRole } from "@/lib/auth/permissions";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  redirect(`/${portalForRole(user.role)}/dashboard`);
}
