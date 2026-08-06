"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { submitContentAction } from "@/lib/actions/content";
import { ALLOWED_CONTENT_MIME_TYPES } from "@/lib/validations/upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContentUploader({ deliverableId }: { deliverableId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const presignResponse = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableId,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });

      if (!presignResponse.ok) {
        const body = await presignResponse.json().catch(() => null);
        throw new Error(body?.error ?? "Couldn't prepare the upload.");
      }

      const { uploadUrl, storageKey, publicUrl } = await presignResponse.json();

      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putResponse.ok) throw new Error("Upload to storage failed.");

      const result = await submitContentAction({
        deliverableId,
        caption,
        storageKey,
        url: publicUrl,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      if (!result.ok) throw new Error(result.error);

      toast.success("Content submitted for review.");
      setFile(null);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <input
          ref={inputRef}
          id="file"
          type="file"
          accept={ALLOWED_CONTENT_MIME_TYPES.join(",")}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={2}
          placeholder="Caption or notes for the reviewer…"
        />
      </div>
      <Button onClick={handleUpload} disabled={!file || uploading}>
        <Upload /> {uploading ? "Uploading…" : "Submit for review"}
      </Button>
    </div>
  );
}
