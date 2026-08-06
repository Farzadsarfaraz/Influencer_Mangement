"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { changeUserRoleAction } from "@/lib/actions/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agencyRoles } from "@/lib/validations/user";
import type { Role } from "@prisma/client";

export function UserRoleSelect({
  userId,
  role,
  disabled,
  canGrantSuperAdmin,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
  canGrantSuperAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const options = agencyRoles.filter(
    (option) => option !== "SUPER_ADMIN" || canGrantSuperAdmin,
  );

  return (
    <Select
      value={role}
      disabled={disabled || pending}
      onValueChange={(next) =>
        startTransition(async () => {
          const result = await changeUserRoleAction(userId, next as Role);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
