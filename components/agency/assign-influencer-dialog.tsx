"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createAssignmentAction } from "@/lib/actions/assignments";
import {
  assignmentSchema,
  type AssignmentInput,
} from "@/lib/validations/assignment";
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
import { Textarea } from "@/components/ui/textarea";

const NO_FLIGHT = "NONE";

export function AssignInfluencerDialog({
  campaignId,
  influencers,
  flights,
}: {
  campaignId: string;
  influencers: { id: string; displayName: string; tier: string | null }[];
  flights: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const defaults: AssignmentInput = {
    campaignId,
    flightId: "",
    influencerId: "",
    currency: "USD",
    dueDate: "",
    notes: "",
  };
  const form = useForm<AssignmentInput>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: AssignmentInput) {
    const result = await createAssignmentAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Influencer assigned.");
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
        <Button disabled={influencers.length === 0}>
          <Plus /> Assign influencer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign influencer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="influencerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Influencer</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select influencer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {influencers.map((influencer) => (
                        <SelectItem key={influencer.id} value={influencer.id}>
                          {influencer.displayName}
                          {influencer.tier ? ` (${influencer.tier})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {flights.length > 0 ? (
              <FormField
                control={form.control}
                name="flightId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight (optional)</FormLabel>
                    <Select
                      value={field.value || NO_FLIGHT}
                      onValueChange={(value) =>
                        field.onChange(value === NO_FLIGHT ? "" : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_FLIGHT}>No flight</SelectItem>
                        {flights.map((flight) => (
                          <SelectItem key={flight.id} value={flight.id}>
                            {flight.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : event.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Assigning…" : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
