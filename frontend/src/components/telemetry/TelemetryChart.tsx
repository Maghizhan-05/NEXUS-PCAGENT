import { memo } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { HistoryPoint } from "@/stores/telemetryStore";

interface Props {
  data: HistoryPoint[];
  dataKey: keyof HistoryPoint;
  color: string;
  /** Fixed 0..100 domain for percentages; "auto" for rates. */
  percent?: boolean;
  id: string;
}

function ChartBase({ data, dataKey, color, percent = true, id }: Props) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={percent ? [0, 100] : [0, "auto"]} />
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            strokeWidth={1.5}
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
