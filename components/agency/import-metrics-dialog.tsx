"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { importMetricSnapshotsAction } from "@/lib/actions/metrics";
import {
  importMetricSnapshotsSchema,
  type ImportMetricSnapshotsInput,
} from "@/lib/validations/metric";
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
import { Textarea } from "@/components/ui/textarea";

const PLACEHOLDER = `date,platform,reach,impressions,engagements,views,clicks
2026-08-01,INSTAGRAM,12000,18000,900,15000,120
2026-08-02,INSTAGRAM,13500,19800,1050,16200,140`;

export function ImportMetricsDialog({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);
  const defaults: ImportMetricSnapshotsInput = { campaignId, csv: "" };
  const form = useForm<ImportMetricSnapshotsInput>({
    resolver: zodResolver(importMetricSnapshotsSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: ImportMetricSnapshotsInput) {
    const result = await importMetricSnapshotsAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Imported ${result.data.imported} rows.`);
    setOpen(false);
    form.reset(defaults);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset(defaults);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import metrics from CSV</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="csv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paste CSV data</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={8} placeholder={PLACEHOLDER} className="font-mono text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Importing…" : "Import"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
