import { memo } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { HistoryPoint } from "@/stores/telemetryStore";

interface Props {
  data: HistoryPoint[];
  dataKey: keyof HistoryPoint;
  color: string;
  percent?: boolean;
  id: string;
  height?: number;
}

function ChartBase({ data, dataKey, color, percent = true, id, height = 40 }: Props) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={percent ? [0, 100] : [0, "auto"]} />
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            strokeWidth={1.25}
            fill={`url(#grad-${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const TelemetryChart = memo(ChartBase);
