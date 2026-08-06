"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileDown } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { requestReportAction } from "@/lib/actions/reports";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RequestReportDialog({ campaignId }: { campaignId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"PDF" | "XLSX">("PDF");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileDown /> New report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate campaign summary report</DialogTitle>
        </DialogHeader>
        <Select value={format} onValueChange={(value) => setFormat(value as "PDF" | "XLSX")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PDF">PDF</SelectItem>
            <SelectItem value="XLSX">Excel (.xlsx)</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await requestReportAction({ campaignId, format });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Report queued — this can take a minute.");
                queryClient.invalidateQueries({ queryKey: ["reports", campaignId] });
                setOpen(false);
              })
            }
          >
            {pending ? "Queuing…" : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
