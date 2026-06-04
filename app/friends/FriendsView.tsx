"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { todayString } from "@/lib/date";
import { useI18n } from "../i18n-context";
import LangToggle from "../LangToggle";

type LeaderRow = {
  id: string;
  name: string;
  isMe: boolean;
  current: number;
  best: number;
  todayPct: number;
  todayMet: boolean;
};
type Request = { id: string; name: string };
type StepRow = { rank: number; id: string; name: string; steps: number; isMe: boolean };

export default function FriendsView() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"streaks" | "steps">("streaks");
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Global steps leaderboard.
  const [stepsPeriod, setStepsPeriod] = useState<"today" | "week">("today");
  const [stepsBoard, setStepsBoard] = useState<StepRow[]>([]);
  const [stepsMe, setStepsMe] = useState<StepRow | null>(null);
  const [stepsLoading, setStepsLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/friends?today=${todayString()}`, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setLeaderboard(d.leaderboard);
      setRequests(d.requests);
    }
    setLoading(false);
  }, []);

  const loadSteps = useCallback(async () => {
    setStepsLoading(true);
    const res = await fetch(
      `/api/leaderboard/steps?period=${stepsPeriod}&today=${todayString()}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const d = await res.json();
      setStepsBoard(d.leaderboard);
      setStepsMe(d.me);
    }
    setStepsLoading(false);
  }, [stepsPeriod]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab === "steps") loadSteps();
  }, [tab, loadSteps]);

  async function addFriend(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSending(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ text: data.error ?? t("Could not send", "Slanje nije uspelo"), ok: false });
        return;
      }
      setMsg({
        text: data.accepted
          ? t("You're now friends! 🎉", "Sad ste prijatelji! 🎉")
          : t("Request sent! 📨", "Zahtev poslat! 📨"),
        ok: true,
      });
      setEmail("");
      load();
    } catch {
      setMsg({ text: t("Network error", "Greška u mreži"), ok: false });
    } finally {
      setSending(false);
    }
  }

  async function respond(id: string, accept: boolean) {
    await fetch(`/api/friends/${id}`, { method: accept ? "PATCH" : "DELETE" });
    load();
  }

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <span className="font-semibold">{t("Friends", "Prijatelji")}</span>
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
        {/* Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 text-sm font-medium">
          <button
            onClick={() => setTab("streaks")}
            className={`rounded-lg py-2 transition-colors ${tab === "streaks" ? "bg-accent text-black" : "text-muted"}`}
          >
            🔥 {t("Streaks", "Nizovi")}
          </button>
          <button
            onClick={() => setTab("steps")}
            className={`rounded-lg py-2 transition-colors ${tab === "steps" ? "bg-accent text-black" : "text-muted"}`}
          >
            👟 {t("Steps (global)", "Koraci (svi)")}
          </button>
        </div>

        {tab === "steps" ? (
          <StepsBoard
            period={stepsPeriod}
            setPeriod={setStepsPeriod}
            board={stepsBoard}
            me={stepsMe}
            loading={stepsLoading}
          />
        ) : (
          <StreaksTab />
        )}
      </main>
    </div>
  );

  function StreaksTab() {
    return (
      <>
        {/* Add friend */}
        <form onSubmit={addFriend} className="mb-5 rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium">{t("Add a friend", "Dodaj prijatelja")}</p>
          <div className="flex gap-2">
            <input
              type="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("their@email.com", "njihov@imejl.com")}
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={sending}
              className="shrink-0 rounded-xl bg-accent px-4 text-sm font-semibold text-black disabled:opacity-50"
            >
              {sending ? "…" : t("Add", "Dodaj")}
            </button>
          </div>
          {msg && (
            <p className={`mt-2 text-xs ${msg.ok ? "text-accent" : "text-danger"}`}>{msg.text}</p>
          )}
        </form>

        {/* Incoming requests */}
        {requests.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 px-1 text-xs font-medium text-muted">{t("Friend requests", "Zahtevi za prijateljstvo")}</p>
            <ul className="space-y-2">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <span className="text-sm font-medium">{r.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(r.id, true)}
                      className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-black"
                    >
                      {t("Accept", "Prihvati")}
                    </button>
                    <button
                      onClick={() => respond(r.id, false)}
                      className="rounded-lg border border-border px-3 py-1 text-xs text-muted"
                    >
                      {t("Decline", "Odbij")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Leaderboard */}
        <p className="mb-2 px-1 text-xs font-medium text-muted">🔥 {t("Streak leaderboard", "Rang lista nizova")}</p>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted">{t("Loading…", "Učitavanje…")}</p>
        ) : leaderboard.length <= 1 ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-sm text-muted">
              {t("No friends yet. Add one above to start competing on streaks! 🏆", "Još nemaš prijatelje. Dodaj nekog gore da se takmičite u nizovima! 🏆")}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {leaderboard.map((row, i) => (
              <li
                key={row.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  row.isMe ? "border-accent/40 bg-accent/10" : "border-border bg-surface"
                }`}
              >
                <span className="w-6 text-center text-sm">{medal(i)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {row.name} {row.isMe && <span className="text-xs text-muted">({t("you", "ti")})</span>}
                  </p>
                  <p className="text-xs text-muted">{row.todayPct}% {t("of goal today", "cilja danas")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-400">🔥 {row.current}</p>
                  <p className="text-[10px] text-muted">{t("best", "najbolji")} {row.best}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }
}

function StepsBoard({
  period,
  setPeriod,
  board,
  me,
  loading,
}: {
  period: "today" | "week";
  setPeriod: (p: "today" | "week") => void;
  board: StepRow[];
  me: StepRow | null;
  loading: boolean;
}) {
  const { t } = useI18n();
  const medal = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
  const meInTop = me && board.some((r) => r.isMe);

  return (
    <>
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
                  {row.name} {row.isMe && <span className="text-xs text-muted">({t("you","ti")})</span>}
                </p>
                <span className="text-sm font-bold text-accent">{row.steps.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {/* Show my rank if I'm outside the top list */}
          {me && !meInTop && (
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
              <span className="w-7 text-center text-sm">{me.rank}.</span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                {me.name} <span className="text-xs text-muted">({t("you","ti")})</span>
              </p>
              <span className="text-sm font-bold text-accent">{me.steps.toLocaleString()}</span>
            </div>
          )}
        </>
      )}
    </>
  );
}
