"use client";

import { useQuery } from "@tanstack/react-query";

import { getReportsForCampaignAction } from "@/lib/actions/reports";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TERMINAL_STATUSES = new Set(["READY", "FAILED"]);

export function ReportHistory({
  campaignId,
  initialReports,
}: {
  campaignId: string;
  initialReports: Awaited<ReturnType<typeof getReportsForCampaignAction>>;
}) {
  const { data: reports } = useQuery({
    queryKey: ["reports", campaignId],
    queryFn: () => getReportsForCampaignAction(campaignId),
    initialData: initialReports,
    refetchInterval: (query) => {
      const stillPending = query.state.data?.some(
        (report) => !TERMINAL_STATUSES.has(report.status),
      );
      return stillPending ? 4_000 : false;
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Requested</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Requested by</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>{report.createdAt.toLocaleString()}</TableCell>
            <TableCell>{report.format}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <UserAvatar
                  name={report.requestedBy.name}
                  image={report.requestedBy.image}
                  size="sm"
                />
                {report.requestedBy.name}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  report.status === "READY"
                    ? "default"
                    : report.status === "FAILED"
                      ? "destructive"
                      : "secondary"
                }
              >
                {report.status}
              </Badge>
            </TableCell>
            <TableCell>
              {report.status === "READY" && report.fileAssetId ? (
                <ReportDownloadLink reportId={report.id} />
              ) : null}
            </TableCell>
          </TableRow>
        ))}
        {reports.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-muted-foreground text-center"
            >
              No reports generated yet.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}

function ReportDownloadLink({ reportId }: { reportId: string }) {
  return (
    <a
      href={`/api/reports/${reportId}/download`}
      className="text-primary text-sm hover:underline"
    >
      Download
    </a>
  );
}
