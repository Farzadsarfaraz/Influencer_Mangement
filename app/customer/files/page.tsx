import type { Metadata } from "next";

import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { getBrandsForUser } from "@/lib/data/brands";
import { getApprovedFilesForBrands } from "@/lib/data/content";

export const metadata: Metadata = { title: "Files" };

export default async function CustomerFilesPage() {
  const user = await requireUser();
  const brands = await getBrandsForUser(user.id);
  const entries = await getApprovedFilesForBrands(brands.map((b) => b.id));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Files</h1>
      <p className="text-muted-foreground text-sm">
        Approved content ready to download, across every campaign you have
        access to.
      </p>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Influencer</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(({ file, submission }) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.fileName}</TableCell>
                <TableCell>
                  {submission.deliverable.assignment.campaign.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={
                        submission.deliverable.assignment.influencer.displayName
                      }
                      image={null}
                      size="sm"
                    />
                    {submission.deliverable.assignment.influencer.displayName}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Download
                  </a>
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground text-center"
                >
                  No approved files yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
