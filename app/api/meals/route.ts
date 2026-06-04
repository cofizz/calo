import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { mealCreateSchema } from "@/lib/validation";

// GET /api/meals -> this user's saved meals with their items.
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const meals = await prisma.meal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json({ meals });
}

// POST /api/meals -> save a new meal (a bundle of food items).
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

  const parsed = mealCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const meal = await prisma.meal.create({
    data: {
      userId,
      name: parsed.data.name,
      items: { create: parsed.data.items },
    },
    include: { items: true },
  });
  return NextResponse.json({ meal }, { status: 201 });
}
