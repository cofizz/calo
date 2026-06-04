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
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-3xl">
            🍃
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Calo</h1>
          <p className="mt-1 text-sm text-muted">
            Your private food &amp; calorie diary
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
