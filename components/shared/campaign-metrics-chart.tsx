"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dataviz reference palette, categorical slots 1–3 (blue/orange/aqua) — the
// subset validated for all-pairs CVD separation, not just adjacent pairs.
const SERIES = {
  reach: { label: "Reach", color: "#2a78d6" },
  impressions: { label: "Impressions", color: "#eb6834" },
  engagements: { label: "Engagements", color: "#1baf7a" },
} as const;

type MetricPoint = {
  date: Date;
  reach: number;
  impressions: number;
  engagements: number;
};

export function CampaignMetricsChart({ data }: { data: MetricPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No metrics logged yet.
      </div>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    label: point.date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(SERIES).map(([key, series]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            <span className="text-muted-foreground">{series.label}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
            }}
          />
          {Object.entries(SERIES).map(([key, series]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={series.label}
              stroke={series.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
