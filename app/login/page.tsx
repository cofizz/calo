import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth";
import AuthForm from "./AuthForm";

// Already signed in? Skip the login screen.
export default async function LoginPage() {
  const userId = await getUserId();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <AuthForm />
      </div>
    </main>
  );
}
