import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth";

// Entry point: send signed-in users to their diary, everyone else to login.
export default async function Home() {
  const userId = await getUserId();
  redirect(userId ? "/dashboard" : "/login");
}
