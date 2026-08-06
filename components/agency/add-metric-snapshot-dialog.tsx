"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { addMetricSnapshotAction } from "@/lib/actions/metrics";
import {
  metricSnapshotSchema,
  type MetricSnapshotInput,
} from "@/lib/validations/metric";
import { platforms } from "@/lib/validations/influencer";
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

const ALL_PLATFORMS = "ALL";

function numberField(field: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return {
    type: "number" as const,
    min: 0,
    value: field.value ?? "",
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      field.onChange(event.target.value === "" ? undefined : event.target.valueAsNumber),
  };
}

export function AddMetricSnapshotDialog({
  campaignId,
  influencers,
}: {
  campaignId: string;
  influencers: { id: string; displayName: string }[];
}) {
  const [open, setOpen] = useState(false);
  const defaults: MetricSnapshotInput = {
    campaignId,
    influencerId: "",
    date: new Date().toISOString().slice(0, 10),
    reach: 0,
    impressions: 0,
    engagements: 0,
    views: 0,
    clicks: 0,
  };
  const form = useForm<MetricSnapshotInput>({
    resolver: zodResolver(metricSnapshotSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: MetricSnapshotInput) {
    const result = await addMetricSnapshotAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Metrics logged.");
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
          <Plus /> Log metrics
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log daily metrics</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      value={field.value ?? ALL_PLATFORMS}
                      onValueChange={(value) =>
                        field.onChange(value === ALL_PLATFORMS ? undefined : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ALL_PLATFORMS}>All platforms</SelectItem>
                        {platforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
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
              name="influencerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Influencer (optional)</FormLabel>
                  <Select
                    value={field.value || ALL_PLATFORMS}
                    onValueChange={(value) =>
                      field.onChange(value === ALL_PLATFORMS ? "" : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ALL_PLATFORMS}>Campaign total</SelectItem>
                      {influencers.map((influencer) => (
                        <SelectItem key={influencer.id} value={influencer.id}>
                          {influencer.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="reach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reach</FormLabel>
                    <FormControl>
                      <Input {...numberField(field)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="impressions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impressions</FormLabel>
                    <FormControl>
                      <Input {...numberField(field)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engagements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagements</FormLabel>
                    <FormControl>
                      <Input {...numberField(field)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Views</FormLabel>
                    <FormControl>
                      <Input {...numberField(field)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clicks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clicks</FormLabel>
                    <FormControl>
                      <Input {...numberField(field)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save metrics"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
