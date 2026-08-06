import { notFound } from "next/navigation";

import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function InviteAcceptPage(
  props: PageProps<"/invite/[token]">,
) {
  const { token } = await props.params;

  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    notFound();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Activate your account</CardTitle>
        <CardDescription>
          Set a password for {verificationToken.identifier}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AcceptInviteForm token={token} />
      </CardContent>
    </Card>
  );
}
