"use client";

// An SVG progress ring showing calories consumed vs. the daily goal.
export default function CalorieRing({
  consumed,
  goal,
  size = 180,
}: {
  consumed: number;
  goal: number;
  size?: number;
}) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const over = consumed > goal;
  const remaining = goal - consumed;
  const dash = circumference * pct;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? "var(--danger)" : "var(--accent)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">
          {Math.round(consumed)}
        </span>
        <span className="text-xs text-muted">of {goal.toLocaleString()} kcal</span>
        <span
          className={`mt-1 text-xs font-medium ${over ? "text-danger" : "text-accent"}`}
        >
          {over
            ? `${Math.abs(Math.round(remaining))} over`
            : `${Math.round(remaining)} left`}
        </span>
      </div>
    </div>
  );
}
