"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { inviteBrandMemberAction } from "@/lib/actions/brands";
import {
  inviteBrandMemberSchema,
  type InviteBrandMemberInput,
} from "@/lib/validations/brand";
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

export function InviteBrandMemberDialog({ brandId }: { brandId: string }) {
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const form = useForm<InviteBrandMemberInput>({
    resolver: zodResolver(inviteBrandMemberSchema),
    defaultValues: { brandId, name: "", email: "", role: "VIEWER" },
  });

  async function onSubmit(values: InviteBrandMemberInput) {
    const result = await inviteBrandMemberAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Contact added.");
    if (result.data.inviteUrl) {
      setInviteUrl(new URL(result.data.inviteUrl, window.location.origin).toString());
    } else {
      setOpen(false);
      form.reset({ brandId, name: "", email: "", role: "VIEWER" });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setInviteUrl(null);
          form.reset({ brandId, name: "", email: "", role: "VIEWER" });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Add contact</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a client contact</DialogTitle>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-3 text-sm">
            <p>
              Account created. Since email delivery isn&apos;t wired up yet,
              share this activation link with them directly:
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
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Adding…" : "Add contact"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
