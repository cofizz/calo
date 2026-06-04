import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";
import { calcGoal, defaultMacros } from "@/lib/calories";

// PATCH /api/profile -> save body stats + intent, compute the daily goal
// server-side (authoritative), and persist both.
export async function PATCH(req: Request) {
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

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { goal, bmr, tdee } = calcGoal(parsed.data);
  const macros = defaultMacros(goal, parsed.data.goalType);

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...parsed.data,
      dailyGoal: goal,
      proteinGoal: macros.protein,
      carbsGoal: macros.carbs,
      fatGoal: macros.fat,
    },
  });

  return NextResponse.json({ dailyGoal: goal, bmr, tdee, ...macros });
}
