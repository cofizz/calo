import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { daySchema } from "@/lib/validation";

// POST /api/meals/:id/log  body: { day }
// Adds every item of the meal to the given day as food entries.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
  const dayParse = daySchema.safeParse((body as { day?: unknown })?.day);
  if (!dayParse.success) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  const { id } = await params;
  // Verify the meal belongs to this user before logging it.
  const meal = await prisma.meal.findFirst({
    where: { id, userId },
    include: { items: true },
  });
  if (!meal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.foodEntry.createMany({
    data: meal.items.map((it) => ({
      userId,
      day: dayParse.data,
      name: it.name,
      calories: it.calories,
      protein: it.protein,
      carbs: it.carbs,
      fat: it.fat,
      meal: it.meal,
    })),
  });

  // Return the freshly-updated day so the client can refresh.
  const entries = await prisma.foodEntry.findMany({
    where: { userId, day: dayParse.data },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ entries }, { status: 201 });
}
