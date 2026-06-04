import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth";
import LeaderboardView from "./LeaderboardView";

export default async function LeaderboardPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");
  return <LeaderboardView />;
}
