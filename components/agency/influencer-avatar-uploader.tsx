"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { updateInfluencerAvatarAction } from "@/lib/actions/influencers";
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_FILE_SIZE_BYTES,
} from "@/lib/validations/upload";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

/**
 * Click the camera badge, pick an image, it uploads and saves immediately —
 * no separate "save" step, matching how most apps handle a single profile
 * photo. The just-picked file previews instantly via an object URL while
 * the real upload/save round-trip happens in the background.
 */
export function InfluencerAvatarUploader({
  influencerId,
  displayName,
  avatarUrl,
}: {
  influencerId: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      toast.error("Image is too large (max 5MB).");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
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
        throw new Error(body?.error ?? "Couldn't prepare the upload.");
      }
      const { uploadUrl, publicUrl } = await presignResponse.json();

      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putResponse.ok) throw new Error("Upload to storage failed.");

      const result = await updateInfluencerAvatarAction({
        influencerId,
        avatarUrl: publicUrl,
      });
      if (!result.ok) throw new Error(result.error);

      toast.success("Photo updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative shrink-0">
      <UserAvatar
        name={displayName}
        image={preview ?? avatarUrl}
        size="lg"
        className={cn(uploading && "opacity-50")}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Change photo"
        className="bg-background hover:bg-accent absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border shadow-sm disabled:opacity-50"
      >
        <Camera className="size-3.5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_AVATAR_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
