import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth";
import FriendsView from "./FriendsView";

export default async function FriendsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");
  return <FriendsView />;
}
