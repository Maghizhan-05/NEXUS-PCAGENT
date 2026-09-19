interface Props {
  color: string;
  label: string;
  pulse?: boolean;
}

export function StatusIndicator({ color, label, pulse = true }: Props) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </span>
      <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color }}>
        {label}
      </span>
    </span>
  );
}
