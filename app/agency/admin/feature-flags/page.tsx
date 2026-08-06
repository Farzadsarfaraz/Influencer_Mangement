import type { Metadata } from "next";

import { CreateFeatureFlagDialog } from "@/components/agency/create-feature-flag-dialog";
import { FeatureFlagToggle } from "@/components/agency/feature-flag-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listFeatureFlags } from "@/lib/data/feature-flags";

export const metadata: Metadata = { title: "Feature flags" };

export default async function FeatureFlagsPage() {
  const flags = await listFeatureFlags();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Feature flags</h1>
        <CreateFeatureFlagDialog />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flag</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-16">Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags.map((flag) => (
              <TableRow key={flag.id}>
                <TableCell className="font-medium">{flag.name}</TableCell>
                <TableCell>
                  <code className="text-xs">{flag.key}</code>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {flag.description}
                </TableCell>
                <TableCell>
                  <FeatureFlagToggle flagId={flag.id} enabled={flag.enabled} />
                </TableCell>
              </TableRow>
            ))}
            {flags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No feature flags yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
