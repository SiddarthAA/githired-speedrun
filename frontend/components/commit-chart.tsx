"use client";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function CommitChart({
  data,
  height = 160,
}: {
  data: { week: string; count: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={6}>
        <XAxis
          dataKey="week"
          tick={false}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
          }}
          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
        />
        <Bar
          dataKey="count"
          fill="hsl(var(--foreground))"
          radius={[2, 2, 0, 0]}
          opacity={0.8}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
