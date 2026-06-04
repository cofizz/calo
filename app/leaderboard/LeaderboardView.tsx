"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { todayString } from "@/lib/date";
import { useI18n } from "../i18n-context";
import LangToggle from "../LangToggle";

type StepRow = { rank: number; id: string; name: string; steps: number; isMe: boolean };

export default function LeaderboardView() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<"today" | "week">("today");
  const [board, setBoard] = useState<StepRow[]>([]);
  const [me, setMe] = useState<StepRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/leaderboard/steps?period=${period}&today=${todayString()}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const d = await res.json();
      setBoard(d.leaderboard);
      setMe(d.me);
    }
    setLoading(false);
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const medal = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
  const meInTop = me && board.some((r) => r.isMe);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-semibold">{t("Leaderboard", "Rang lista")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link href="/dashboard" className="text-xs text-muted hover:text-foreground">
              ← {t("Today", "Danas")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        <p className="mb-3 px-1 text-xs text-muted">
          👟 {t("Global steps ranking — everyone using Calo.", "Globalni poredak koraka — svi koji koriste Calo.")}
        </p>

        {/* Period toggle */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 text-xs font-medium">
          {(["today", "week"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg py-1.5 transition-colors ${period === p ? "bg-accent text-black" : "text-muted"}`}
            >
              {p === "today" ? t("Today", "Danas") : t("This week", "Ove nedelje")}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted">{t("Loading…", "Učitavanje…")}</p>
        ) : board.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-sm text-muted">
              {t("No steps logged yet anywhere. Be the first — start walk mode! 🚶", "Još niko nije uneo korake. Budi prvi — pokreni brojač! 🚶")}
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {board.map((row) => (
                <li
                  key={row.id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    row.isMe ? "border-accent/40 bg-accent/10" : "border-border bg-surface"
                  }`}
                >
                  <span className="w-7 text-center text-sm">{medal(row.rank)}</span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">
                    {row.name} {row.isMe && <span className="text-xs text-muted">({t("you", "ti")})</span>}
                  </p>
                  <span className="text-sm font-bold text-accent">{row.steps.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {me && !meInTop && (
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
                <span className="w-7 text-center text-sm">{me.rank}.</span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                  {me.name} <span className="text-xs text-muted">({t("you", "ti")})</span>
                </p>
                <span className="text-sm font-bold text-accent">{me.steps.toLocaleString()}</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
