import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserProgress } from "@/lib/streak";

// GET /api/streak?today=YYYY-MM-DD
// Returns the user's current and best streak of days that hit their goal.
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const today =
    new URL(req.url).searchParams.get("today") ?? new Date().toISOString().slice(0, 10);

  const progress = await getUserProgress(userId, today);
  if (!progress) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    current: progress.current,
    best: progress.best,
    todayMet: progress.todayMet,
  });
}
