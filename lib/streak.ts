// Shared streak / daily-progress computation, used by both the streak endpoint
// and the friends leaderboard.
import "server-only";
import { prisma } from "./prisma";
import { metGoal } from "./calories";

export function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

export type UserProgress = {
  current: number;
  best: number;
  todayMet: boolean;
  todayCalories: number;
  goal: number;
  goalType: string | null;
};

// Compute a user's current + best streak and today's calories, relative to the
// caller's local `today` (YYYY-MM-DD).
export async function getUserProgress(
  userId: string,
  today: string,
): Promise<UserProgress | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyGoal: true, goalType: true },
  });
  if (!user) return null;

  const from = addDays(today, -120);
  const rows = await prisma.foodEntry.findMany({
    where: { userId, day: { gte: from, lte: today } },
    select: { day: true, calories: true },
  });

  const cals = new Map<string, number>();
  for (const r of rows) cals.set(r.day, (cals.get(r.day) ?? 0) + r.calories);
  const met = (day: string) => metGoal(cals.get(day) ?? 0, user.dailyGoal, user.goalType);

  // Current streak — count back from today (or yesterday if today isn't met yet).
  let current = 0;
  let cursor = met(today) ? today : addDays(today, -1);
  while (met(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Best streak across the window.
  let best = 0;
  let run = 0;
  for (let i = 120; i >= 0; i--) {
    if (met(addDays(today, -i))) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  return {
    current,
    best,
    todayMet: met(today),
    todayCalories: cals.get(today) ?? 0,
    goal: user.dailyGoal,
    goalType: user.goalType,
  };
}
