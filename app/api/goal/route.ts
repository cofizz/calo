import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { goalSchema } from "@/lib/validation";
import { defaultMacros, type GoalType } from "@/lib/calories";

// PATCH /api/goal  -> update this user's daily calorie goal.
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

  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid goal" },
      { status: 400 },
    );
  }

  // Re-derive macro goals from the new calorie goal + the user's plan.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { goalType: true, weightKg: true },
  });
  const plan = (user?.goalType as GoalType) ?? "maintain";
  const macros = defaultMacros(parsed.data.dailyGoal, plan, user?.weightKg);

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyGoal: parsed.data.dailyGoal,
      proteinGoal: macros.protein,
      carbsGoal: macros.carbs,
      fatGoal: macros.fat,
    },
  });

  return NextResponse.json({ ok: true, ...macros });
}
