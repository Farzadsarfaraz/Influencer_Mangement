"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createAgencyUserAction } from "@/lib/actions/users";
import {
  agencyRoles,
  createAgencyUserSchema,
  type CreateAgencyUserInput,
} from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateAgencyUserDialog({
  canGrantSuperAdmin,
}: {
  canGrantSuperAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const defaults: CreateAgencyUserInput = { name: "", email: "", role: "AGENCY_MEMBER" };
  const form = useForm<CreateAgencyUserInput>({
    resolver: zodResolver(createAgencyUserSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: CreateAgencyUserInput) {
    const result = await createAgencyUserAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setInviteUrl(new URL(result.data.inviteUrl, window.location.origin).toString());
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setInviteUrl(null);
          form.reset(defaults);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus /> New user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add agency user</DialogTitle>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-3 text-sm">
            <p>
              Account created. Share this activation link (email delivery isn&apos;t
              wired up yet):
            </p>
            <code className="block truncate rounded-md bg-muted p-2 text-xs">
              {inviteUrl}
            </code>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agencyRoles
                          .filter((role) => role !== "SUPER_ADMIN" || canGrantSuperAdmin)
                          .map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.replace("_", " ")}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating…" : "Create user"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
