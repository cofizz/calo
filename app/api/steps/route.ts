import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { daySchema, stepsSchema } from "@/lib/validation";

// GET /api/steps?day=YYYY-MM-DD -> this user's step count for the day.
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const dayParse = daySchema.safeParse(new URL(req.url).searchParams.get("day"));
  if (!dayParse.success) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }
  const row = await prisma.stepLog.findUnique({
    where: { userId_day: { userId, day: dayParse.data } },
  });
  return NextResponse.json({ steps: row?.steps ?? 0 });
}

// PUT /api/steps  body: { day, steps } -> set (upsert) the day's step count.
export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = stepsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const row = await prisma.stepLog.upsert({
    where: { userId_day: { userId, day: parsed.data.day } },
    create: { userId, day: parsed.data.day, steps: parsed.data.steps },
    update: { steps: parsed.data.steps },
  });
  return NextResponse.json({ steps: row.steps });
}
