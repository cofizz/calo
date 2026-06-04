import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WeekView from "./WeekView";

export default async function StatsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyGoal: true },
  });
  if (!user) redirect("/login");

  return <WeekView dailyGoal={user.dailyGoal} />;
}
