"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createInfluencerAction,
  updateInfluencerAction,
  updateInfluencerAvatarAction,
} from "@/lib/actions/influencers";
import {
  influencerSchema,
  influencerStatuses,
  influencerTiers,
  type InfluencerInput,
} from "@/lib/validations/influencer";
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_FILE_SIZE_BYTES,
} from "@/lib/validations/upload";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

/**
 * Uploads a picked photo to S3 and saves it on the influencer record.
 * Called after create/update so we always have a real influencerId — there's
 * no "pending" upload state, the file just sits in local component state
 * until the form actually submits successfully.
 */
async function uploadInfluencerPhoto(influencerId: string, file: File) {
  const presignResponse = await fetch("/api/uploads/presign-avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      influencerId,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    }),
  });
  if (!presignResponse.ok) {
    const body = await presignResponse.json().catch(() => null);
    throw new Error(body?.error ?? "Couldn't prepare the photo upload.");
  }
  const { uploadUrl, publicUrl } = await presignResponse.json();

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putResponse.ok) throw new Error("Photo upload to storage failed.");

  const result = await updateInfluencerAvatarAction({
    influencerId,
    avatarUrl: publicUrl,
  });
  if (!result.ok) throw new Error(result.error);
}

export function InfluencerForm({
  influencerId,
  defaultValues,
  avatarUrl,
}: {
  influencerId?: string;
  defaultValues?: Partial<InfluencerInput>;
  avatarUrl?: string | null;
}) {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<InfluencerInput>({
    resolver: zodResolver(influencerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phone: "",
      bio: "",
      location: "",
      status: "PROSPECT",
      tags: "",
      ...defaultValues,
    },
  });
  const displayName = useWatch({ control: form.control, name: "displayName" });

  function handlePhotoPick(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      toast.error("Image is too large (max 5MB).");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: InfluencerInput) {
    if (influencerId) {
      const result = await updateInfluencerAction(influencerId, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (photoFile) {
        try {
          await uploadInfluencerPhoto(influencerId, photoFile);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Photo upload failed.",
          );
        }
      }
      toast.success("Influencer updated.");
      router.push(`/agency/influencers/${influencerId}`);
      return;
    }

    const result = await createInfluencerAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (photoFile) {
      try {
        await uploadInfluencerPhoto(result.data.influencerId, photoFile);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Photo upload failed.",
        );
      }
    }
    toast.success("Influencer created.");
    router.push(`/agency/influencers/${result.data.influencerId}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <UserAvatar
              name={displayName || "?"}
              image={photoPreview ?? avatarUrl}
              size="lg"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              aria-label="Add photo"
              className="bg-background hover:bg-accent absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border shadow-sm"
            >
              <Camera className="size-3.5" />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept={ALLOWED_AVATAR_MIME_TYPES.join(",")}
              className="hidden"
              onChange={(event) => handlePhotoPick(event.target.files?.[0])}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            {photoFile ? photoFile.name : "Optional — add a photo."}
          </p>
        </div>
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tier</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {influencerTiers.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {influencerStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input {...field} placeholder="comma, separated, tags" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving…"
            : influencerId
              ? "Save changes"
              : "Create influencer"}
        </Button>
      </form>
    </Form>
  );
}
