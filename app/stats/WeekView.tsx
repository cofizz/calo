"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addDays, todayString } from "@/lib/date";

type DayStat = { day: string; calories: number; protein: number; carbs: number; fat: number };

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
] as const;

export default function WeekView({ dailyGoal }: { dailyGoal: number }) {
  const [range, setRange] = useState<number>(7);
  const [stats, setStats] = useState<Map<string, DayStat>>(new Map());
  const [loading, setLoading] = useState(true);

  // Build the ordered list of day-strings for the selected range (oldest first).
  const days = useMemo(() => {
    const today = todayString();
    return Array.from({ length: range }, (_, i) => addDays(today, -(range - 1 - i)));
  }, [range]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = days[0];
      const to = days[days.length - 1];
      const res = await fetch(`/api/stats?from=${from}&to=${to}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const m = new Map<string, DayStat>();
        for (const d of data.days as DayStat[]) m.set(d.day, d);
        setStats(m);
      }
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  // Merge zeros for days with no entries.
  const series = days.map(
    (day) => stats.get(day) ?? { day, calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const loggedDays = series.filter((d) => d.calories > 0);
  const avg = (key: keyof DayStat) =>
    loggedDays.length
      ? Math.round(loggedDays.reduce((s, d) => s + (d[key] as number), 0) / loggedDays.length)
      : 0;

  const maxVal = Math.max(dailyGoal, ...series.map((d) => d.calories)) * 1.1 || 1;
  const goalTop = `${(1 - dailyGoal / maxVal) * 100}%`;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="font-semibold">Stats</span>
          </div>
          <Link href="/dashboard" className="text-xs text-muted hover:text-foreground">
            ← Today
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        {/* Range switch */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 text-sm font-medium">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`rounded-lg py-2 transition-colors ${
                range === r.days ? "bg-accent text-black" : "text-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Calories bar chart */}
        <section className="mb-5 rounded-3xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium">Calories per day</h2>
            <span className="text-xs text-muted">goal {dailyGoal.toLocaleString()}</span>
          </div>

          <div className="relative h-44">
            {/* Goal line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-accent/60"
              style={{ top: goalTop }}
            >
              <span className="absolute -top-2 right-0 bg-surface px-1 text-[10px] text-accent">
                goal
              </span>
            </div>

            {/* Bars */}
            <div className="flex h-full items-end gap-1">
              {series.map((d) => {
                const over = d.calories > dailyGoal;
                const h = `${(d.calories / maxVal) * 100}%`;
                return (
                  <div key={d.day} className="flex h-full flex-1 flex-col justify-end" title={`${d.day}: ${d.calories} kcal`}>
                    <div
                      className={`w-full rounded-t ${over ? "bg-danger" : "bg-accent"} ${d.calories === 0 ? "opacity-20" : ""}`}
                      style={{ height: h || "2px", minHeight: "2px" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X labels */}
          <div className="mt-2 flex gap-1">
            {series.map((d, i) => (
              <div key={d.day} className="flex-1 text-center text-[10px] text-muted">
                {range <= 7 ? weekdayLetter(d.day) : i % 5 === 0 ? d.day.slice(8) : ""}
              </div>
            ))}
          </div>
        </section>

        {/* Averages */}
        <section className="rounded-3xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-medium">
            Daily average{" "}
            <span className="text-xs font-normal text-muted">
              ({loggedDays.length} logged {loggedDays.length === 1 ? "day" : "days"})
            </span>
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label="Calories" value={avg("calories")} />
            <Stat label="Protein" value={avg("protein")} unit="g" />
            <Stat label="Carbs" value={avg("carbs")} unit="g" />
            <Stat label="Fat" value={avg("fat")} unit="g" />
          </div>
          {loading && <p className="mt-3 text-center text-xs text-muted">Loading…</p>}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 py-3">
      <p className="text-base font-semibold">
        {value}
        {unit && <span className="text-xs font-normal text-muted">{unit}</span>}
      </p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function weekdayLetter(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return ["S", "M", "T", "W", "T", "F", "S"][new Date(y, m - 1, d).getDay()];
}
