import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DayView from "./DayView";
import type { Profile } from "./GoalCalculator";
import type { Activity, GoalType, Sex } from "@/lib/calories";

export default async function DashboardPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      username: true,
      dailyGoal: true,
      proteinGoal: true,
      carbsGoal: true,
      fatGoal: true,
      sex: true,
      age: true,
      heightCm: true,
      weightKg: true,
      activity: true,
      goalType: true,
    },
  });
  if (!user) redirect("/login");

  const profile: Profile = {
    sex: (user.sex as Sex) ?? null,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    activity: (user.activity as Activity) ?? null,
    goalType: (user.goalType as GoalType) ?? null,
  };

  return (
    <DayView
      email={user.email}
      hasUsername={!!user.username}
      initialGoal={user.dailyGoal}
      initialMacros={{ protein: user.proteinGoal, carbs: user.carbsGoal, fat: user.fatGoal }}
      profile={profile}
    />
  );
}
