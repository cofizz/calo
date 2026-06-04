import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { addDays } from "@/lib/streak";

// GET /api/leaderboard/steps?period=today|week&today=YYYY-MM-DD
// Global ranking of ALL users by steps (today or last 7 days).
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const url = new URL(req.url);
  const period = url.searchParams.get("period") === "week" ? "week" : "today";
  const today = url.searchParams.get("today") ?? new Date().toISOString().slice(0, 10);
  const from = period === "week" ? addDays(today, -6) : today;

  // Sum steps per user across the range.
  const grouped = await prisma.stepLog.groupBy({
    by: ["userId"],
    where: { day: { gte: from, lte: today } },
    _sum: { steps: true },
  });

  const totals = grouped
    .map((g) => ({ userId: g.userId, steps: g._sum.steps ?? 0 }))
    .filter((t) => t.steps > 0)
    .sort((a, b) => b.steps - a.steps);

  // Names for the people on the board.
  const users = await prisma.user.findMany({
    where: { id: { in: totals.map((t) => t.userId) } },
    select: { id: true, username: true, name: true, email: true },
  });
  const nameOf = new Map(
    users.map((u) => [u.id, u.username?.trim() || u.name?.trim() || u.email.split("@")[0]]),
  );

  const ranked = totals.map((t, i) => ({
    rank: i + 1,
    id: t.userId,
    name: nameOf.get(t.userId) ?? "Someone",
    steps: t.steps,
    isMe: t.userId === userId,
  }));

  // Top 50, but always include the caller's own row + rank.
  const top = ranked.slice(0, 50);
  const mine = ranked.find((r) => r.isMe) ?? null;

  return NextResponse.json({ period, leaderboard: top, me: mine });
}
