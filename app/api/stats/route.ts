import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { daySchema } from "@/lib/validation";

// GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns this user's per-day calorie + macro totals across the range.
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fromParse = daySchema.safeParse(searchParams.get("from"));
  const toParse = daySchema.safeParse(searchParams.get("to"));
  if (!fromParse.success || !toParse.success) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  // YYYY-MM-DD strings sort the same lexically as chronologically.
  const entries = await prisma.foodEntry.findMany({
    where: { userId, day: { gte: fromParse.data, lte: toParse.data } },
    select: { day: true, calories: true, protein: true, carbs: true, fat: true },
  });

  // Aggregate by day.
  const byDay = new Map<
    string,
    { day: string; calories: number; protein: number; carbs: number; fat: number }
  >();
  for (const e of entries) {
    const d = byDay.get(e.day) ?? {
      day: e.day,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    d.calories += e.calories;
    d.protein += e.protein;
    d.carbs += e.carbs;
    d.fat += e.fat;
    byDay.set(e.day, d);
  }

  return NextResponse.json({ days: Array.from(byDay.values()) });
}
