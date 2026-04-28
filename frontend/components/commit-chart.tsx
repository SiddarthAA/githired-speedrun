"use client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const tooltipStyle = {
  fontSize: 11,
  border: "1px solid hsl(var(--border))",
  borderRadius: 6,
  background: "hsl(var(--background))",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

function fmtLabel(label: string) {
  const parts = String(label).split("-W");
  return parts.length > 1 ? `Week ${parts[1]}` : label;
}

type FmtResult = [string | number, string];
function fmtValue(v: string | number): FmtResult {
  return [v, "commits"];
}

export function CommitChart({
  data,
  height = 160,
  variant = "bar",
}: {
  data: { week: string; count: number }[];
  height?: number;
  variant?: "bar" | "area";
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (variant === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="commitAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.18} />
              <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="week"
            tickFormatter={fmtLabel}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={fmtValue}
            labelFormatter={fmtLabel}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--foreground))"
            strokeWidth={1.5}
            fill="url(#commitAreaGrad)"
            dot={false}
            activeDot={{ r: 3, fill: "hsl(var(--foreground))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        barSize={Math.max(3, Math.floor(400 / Math.max(data.length, 1)) - 2)}
      >
        <XAxis dataKey="week" tick={false} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={fmtValue}
          labelFormatter={fmtLabel}
        />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill="hsl(var(--foreground))"
              opacity={
                entry.count === 0
                  ? 0.06
                  : 0.15 + (entry.count / maxCount) * 0.75
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
