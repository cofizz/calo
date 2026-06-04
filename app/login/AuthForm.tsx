"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "../i18n-context";
import LangToggle from "../LangToggle";

type Mode = "login" | "signup";

export default function AuthForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("login");
  const [identifier, setIdentifier] = useState(""); // login: username OR email
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload =
        mode === "signup" ? { email, username, password } : { identifier, password };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      // Refresh so the server re-reads the new session cookie, then go to diary.
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-3xl">
          🍃
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Calo</h1>
        <p className="mt-1 text-sm text-muted">
          {t("Your private food & calorie diary", "Tvoj privatni dnevnik hrane i kalorija")}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex justify-end">
          <LangToggle />
        </div>
      {/* Tab switch between Log in and Sign up */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 text-sm font-medium">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded-lg py-2 transition-colors ${
              mode === m ? "bg-accent text-black" : "text-muted hover:text-foreground"
            }`}
          >
            {m === "login" ? t("Log in", "Prijava") : t("Sign up", "Registracija")}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "login" ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              {t("Username or email", "Korisničko ime ili imejl")}
            </label>
            <input
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t("username or you@example.com", "korisnik ili ti@primer.com")}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {t("Username", "Korisničko ime")}
              </label>
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("e.g. filip21", "npr. filip21")}
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("Email", "Imejl")}</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
          </>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            {t("Password", "Lozinka")}
          </label>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? t("At least 8 characters", "Najmanje 8 znakova") : "••••••••"}
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? t("Please wait…", "Sačekajte…")
            : mode === "login"
              ? t("Log in", "Prijavi se")
              : t("Create account", "Napravi nalog")}
        </button>
      </form>
      </div>
    </>
  );
}
