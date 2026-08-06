import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { CampaignSummaryReportData } from "@/lib/reports/data";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#18181b", fontFamily: "Helvetica" },
  eyebrow: { fontSize: 9, color: "#4338ca", fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#71717a", marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 20, marginBottom: 8 },
  statRow: { flexDirection: "row", gap: 16, marginBottom: 4 },
  statBox: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
  },
  statLabel: { fontSize: 8, color: "#71717a", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: 700 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
    paddingBottom: 6,
    fontWeight: 700,
  },
  cell: { flex: 1 },
  footer: { position: "absolute", bottom: 24, left: 40, fontSize: 8, color: "#a1a1aa" },
});

export function CampaignSummaryPdf({ data }: { data: CampaignSummaryReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OCTAGON — CAMPAIGN SUMMARY</Text>
        <Text style={styles.title}>{data.campaign.name}</Text>
        <Text style={styles.subtitle}>
          {data.campaign.brandName} · {data.campaign.status.replace("_", " ")}
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>REACH</Text>
            <Text style={styles.statValue}>{data.summary.reach.toLocaleString()}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>IMPRESSIONS</Text>
            <Text style={styles.statValue}>
              {data.summary.impressions.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ENGAGEMENT RATE</Text>
            <Text style={styles.statValue}>
              {data.summary.engagementRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>VIEWS</Text>
            <Text style={styles.statValue}>{data.summary.views.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Performance by influencer</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.cell}>Influencer</Text>
          <Text style={styles.cell}>Reach</Text>
          <Text style={styles.cell}>Impressions</Text>
          <Text style={styles.cell}>Engagements</Text>
        </View>
        {data.byInfluencer.map((row) => (
          <View key={row.influencerId} style={styles.tableRow}>
            <Text style={styles.cell}>{row.displayName}</Text>
            <Text style={styles.cell}>{row.reach.toLocaleString()}</Text>
            <Text style={styles.cell}>{row.impressions.toLocaleString()}</Text>
            <Text style={styles.cell}>{row.engagements.toLocaleString()}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Assignments</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.cell}>Influencer</Text>
          <Text style={styles.cell}>Status</Text>
          <Text style={styles.cell}>Fee</Text>
          <Text style={styles.cell}>Deliverables</Text>
        </View>
        {data.assignments.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{row.influencerName}</Text>
            <Text style={styles.cell}>{row.status.replace("_", " ")}</Text>
            <Text style={styles.cell}>
              {row.fee ? `$${row.fee.toLocaleString()}` : "—"}
            </Text>
            <Text style={styles.cell}>{row.deliverableCount}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Generated {data.generatedAt.toLocaleString()} by Octagon
        </Text>
      </Page>
    </Document>
  );
}
