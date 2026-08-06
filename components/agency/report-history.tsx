"use client";

import { useQuery } from "@tanstack/react-query";

import { getReportsForCampaignAction } from "@/lib/actions/reports";
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
            <TableCell>{report.requestedBy.name}</TableCell>
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
            <TableCell colSpan={5} className="text-center text-muted-foreground">
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
      className="text-sm text-primary hover:underline"
    >
      Download
    </a>
  );
}
