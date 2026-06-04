import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { daySchema, foodEntrySchema } from "@/lib/validation";

// GET /api/entries?day=YYYY-MM-DD  -> this user's entries for that day.
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dayParse = daySchema.safeParse(searchParams.get("day"));
  if (!dayParse.success) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  const entries = await prisma.foodEntry.findMany({
    // Scoped to userId — a user can only ever read their own entries.
    where: { userId, day: dayParse.data },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ entries });
}

// POST /api/entries  -> add a new food entry for this user.
export async function POST(req: Request) {
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

  const parsed = foodEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const entry = await prisma.foodEntry.create({
    // userId comes from the verified session cookie, never from the request body —
    // so a user can't create entries under someone else's account.
    data: { ...parsed.data, userId },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
