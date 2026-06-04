"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDays, friendlyDay, todayString } from "@/lib/date";
import { useI18n } from "../i18n-context";
import LangToggle from "../LangToggle";
import CalorieRing from "./CalorieRing";
import MacroRing from "./MacroRing";
import StepCounter from "./StepCounter";
import AddFoodForm, { type Prefill } from "./AddFoodForm";
import GoalCalculator, { type Profile } from "./GoalCalculator";
import DogReaction, { getDogReaction } from "./DogReaction";

export type Entry = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: string;
  day: string;
};

type SavedFood = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type MealItemInput = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: string;
};

type Meal = { id: string; name: string; items: MealItemInput[] };

const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: "🌅" },
  { key: "lunch", label: "Lunch", icon: "☀️" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "snack", label: "Snacks", icon: "🍎" },
] as const;

type Macros = { protein: number; carbs: number; fat: number };

export default function DayView({
  email,
  initialGoal,
  initialMacros,
  profile: initialProfile,
}: {
  email: string;
  initialGoal: number;
  initialMacros: Macros;
  profile: Profile;
}) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const mealLabel = (key: string) =>
    ({
      breakfast: t("Breakfast", "Doručak"),
      lunch: t("Lunch", "Ručak"),
      dinner: t("Dinner", "Večera"),
      snack: t("Snacks", "Užina"),
    })[key] ?? key;
  // Profile is stateful so the calculator reflects the latest saved values
  // immediately (no refresh needed).
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [day, setDay] = useState(todayString());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [streak, setStreak] = useState<{ current: number; best: number } | null>(null);
  const [savingMeal, setSavingMeal] = useState<{ name: string; items: MealItemInput[] } | null>(null);
  const [goal, setGoal] = useState(initialGoal);
  const [macroGoals, setMacroGoals] = useState<Macros>(initialMacros);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadEntries = useCallback(
    async (d: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/entries?day=${d}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries);
        } else if (res.status === 401) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const loadFoods = useCallback(async () => {
    const res = await fetch("/api/foods", { cache: "no-store" });
    if (res.ok) setSavedFoods((await res.json()).foods);
  }, []);

  const loadMeals = useCallback(async () => {
    const res = await fetch("/api/meals", { cache: "no-store" });
    if (res.ok) setMeals((await res.json()).meals);
  }, []);

  const loadStreak = useCallback(async () => {
    const res = await fetch(`/api/streak?today=${todayString()}`, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setStreak({ current: d.current, best: d.best });
    }
  }, []);

  useEffect(() => {
    loadEntries(day);
  }, [day, loadEntries]);

  useEffect(() => {
    loadFoods();
    loadMeals();
  }, [loadFoods, loadMeals]);

  // Recompute the streak whenever the day's entries or the goal change.
  useEffect(() => {
    loadStreak();
  }, [entries, goal, loadStreak]);

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, e) => {
          acc.calories += e.calories;
          acc.protein += e.protein;
          acc.carbs += e.carbs;
          acc.fat += e.fat;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [entries],
  );

  // The dog reacts to today's progress — judged against the user's plan
  // (cut/bulk/maintain), so "under goal" is praised on a cut but scolded on a bulk.
  const dogReaction = useMemo(
    () => getDogReaction(totals.calories, goal, profile.goalType),
    [totals.calories, goal, profile.goalType],
  );

  async function handleAdd(input: Omit<Entry, "id" | "day">) {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, day }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setEntries((prev) => [...prev, entry]);
      return true;
    }
    return false;
  }

  async function handleDelete(id: string) {
    const prev = entries;
    setEntries((e) => e.filter((x) => x.id !== id));
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (!res.ok) setEntries(prev);
  }

  async function saveToLibrary(food: Omit<SavedFood, "id">) {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(food),
    });
    if (res.ok) {
      const { food: created } = await res.json();
      setSavedFoods((prev) => [created, ...prev]);
    }
  }

  async function deleteSavedFood(id: string) {
    const prev = savedFoods;
    setSavedFoods((f) => f.filter((x) => x.id !== id));
    const res = await fetch(`/api/foods/${id}`, { method: "DELETE" });
    if (!res.ok) setSavedFoods(prev);
  }

  // Tapping a saved food opens the add form pre-filled (so you can pick a meal).
  function useSavedFood(f: SavedFood) {
    setPrefill({
      name: f.name,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      seed: Date.now(),
    });
  }

  // --- Meals (recipes) ---

  // Open the "save as meal" modal from a group of the day's entries.
  function openSaveMeal(defaultName: string, groupEntries: Entry[]) {
    setSavingMeal({
      name: defaultName,
      items: groupEntries.map((e) => ({
        name: e.name,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        meal: e.meal,
      })),
    });
  }

  async function saveMeal(name: string) {
    if (!savingMeal) return;
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, items: savingMeal.items }),
    });
    if (res.ok) {
      const { meal } = await res.json();
      setMeals((prev) => [meal, ...prev]);
    }
    setSavingMeal(null);
  }

  // Add every item of a saved meal to the current day.
  async function logMeal(mealId: string) {
    const res = await fetch(`/api/meals/${mealId}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day }),
    });
    if (res.ok) setEntries((await res.json()).entries);
  }

  async function deleteMeal(id: string) {
    const prev = meals;
    setMeals((m) => m.filter((x) => x.id !== id));
    const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
    if (!res.ok) setMeals(prev);
  }

  async function saveGoal(next: number) {
    setGoal(next);
    setEditingGoal(false);
    const res = await fetch("/api/goal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyGoal: next }),
    });
    // The server re-derives macro goals from the new calorie goal.
    if (res.ok) {
      const m = await res.json();
      if (typeof m.protein === "number")
        setMacroGoals({ protein: m.protein, carbs: m.carbs, fat: m.fat });
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍃</span>
            <span className="font-semibold">Calo</span>
          </div>
          {/* Burger menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg text-foreground"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 z-30 w-48 rounded-2xl border border-border bg-surface p-2 shadow-2xl shadow-black/50">
                  <div className="mb-2 flex justify-center border-b border-border pb-2">
                    <LangToggle />
                  </div>
                  <Link href="/stats" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                    📊 {t("Stats", "Statistika")}
                  </Link>
                  <Link href="/friends" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                    👥 {t("Friends", "Prijatelji")}
                  </Link>
                  <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                    🏆 {t("Leaderboard", "Rang lista")}
                  </Link>
                  <button
                    onClick={logout}
                    className="mt-1 block w-full rounded-lg border-t border-border px-3 py-2 text-left text-sm text-muted hover:bg-surface-2"
                  >
                    🚪 {t("Log out", "Odjava")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        {/* Date navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setDay((d) => addDays(d, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-foreground"
            aria-label="Previous day"
          >
            ‹
          </button>
          <button onClick={() => setDay(todayString())} className="text-sm font-medium">
            {friendlyDay(day, lang)}
          </button>
          <button
            onClick={() => setDay((d) => addDays(d, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-foreground"
            aria-label="Next day"
          >
            ›
          </button>
        </div>

        {/* Streak pill */}
        <div className="mb-4 flex justify-center">
          {streak && streak.current > 0 ? (
            <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm">
              <span className="font-semibold text-orange-400">🔥 {streak.current}{t("-day streak", "-dnevni niz")}</span>
              {streak.best > streak.current && (
                <span className="text-xs text-muted">{t("best", "najbolji")} {streak.best}</span>
              )}
            </div>
          ) : (
            <div className="rounded-full bg-surface px-4 py-1.5 text-xs text-muted">
              🔥 {t("Hit today's goal to start a streak", "Ispuni današnji cilj da započneš niz")}
            </div>
          )}
        </div>

        {/* Calorie summary */}
        <section className="mb-5 rounded-3xl border border-border bg-surface p-6">
          <CalorieRing consumed={totals.calories} goal={goal} />

          <div className="mt-5 flex items-start justify-around">
            <MacroRing label={t("Protein", "Proteini")} consumed={totals.protein} goal={macroGoals.protein} color="#60a5fa" />
            <MacroRing label={t("Carbs", "Ugljeni h.")} consumed={totals.carbs} goal={macroGoals.carbs} color="#fbbf24" />
            <MacroRing label={t("Fat", "Masti")} consumed={totals.fat} goal={macroGoals.fat} color="#f472b6" />
          </div>

          {/* Sister's dog reacts below the macros (appears once you log food) */}
          <DogReaction reaction={dogReaction} />

          <div className="mt-4 flex flex-col items-center gap-2 text-xs text-muted">
            {editingGoal ? (
              <GoalEditor
                current={goal}
                onSave={saveGoal}
                onCancel={() => setEditingGoal(false)}
              />
            ) : (
              <>
                <span>{t("Daily goal", "Dnevni cilj")}: {goal.toLocaleString()} kcal</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCalc(true)}
                    className="rounded-full bg-accent/15 px-3 py-1 font-medium text-accent"
                  >
                    🧮 {t("Calculate", "Izračunaj")}
                  </button>
                  <button
                    onClick={() => setEditingGoal(true)}
                    className="rounded-full bg-surface-2 px-3 py-1"
                  >
                    {t("Edit manually", "Ručno")}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Steps */}
        <StepCounter day={day} />

        {/* Saved meals quick-add */}
        {meals.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 px-1 text-xs font-medium text-muted">🍱 {t("Your meals", "Tvoji obroci")}</p>
            <div className="flex flex-wrap gap-2">
              {meals.map((m) => {
                const cals = m.items.reduce((s, it) => s + it.calories, 0);
                return (
                  <span
                    key={m.id}
                    className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 py-1 pl-3 pr-1.5 text-xs"
                  >
                    <button onClick={() => logMeal(m.id)} className="font-medium text-accent">
                      {m.name}{" "}
                      <span className="text-muted">· {cals} · {m.items.length} {t("items", "stavki")}</span>
                    </button>
                    <button
                      onClick={() => deleteMeal(m.id)}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-muted hover:text-danger"
                      aria-label={`Delete meal ${m.name}`}
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Saved foods quick-add */}
        {savedFoods.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 px-1 text-xs font-medium text-muted">{t("Your foods", "Tvoja hrana")}</p>
            <div className="flex flex-wrap gap-2">
              {savedFoods.map((f) => (
                <span
                  key={f.id}
                  className="group flex items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-3 pr-1.5 text-xs"
                >
                  <button onClick={() => useSavedFood(f)} className="font-medium">
                    {f.name}{" "}
                    <span className="text-muted">· {f.calories}</span>
                  </button>
                  <button
                    onClick={() => deleteSavedFood(f.id)}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-muted hover:text-danger"
                    aria-label={`Remove ${f.name} from library`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add food */}
        <AddFoodForm onAdd={handleAdd} onSaveToLibrary={saveToLibrary} prefill={prefill} />

        {/* Entries grouped by meal */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted">{t("Loading…", "Učitavanje…")}</p>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              {t("Nothing logged yet. Add your first food above. 🥗", "Još ništa nije uneto. Dodaj prvu hranu gore. 🥗")}
            </p>
          ) : (
            MEALS.map((meal) => {
              const items = entries.filter((e) => e.meal === meal.key);
              if (items.length === 0) return null;
              const mealCals = items.reduce((s, e) => s + e.calories, 0);
              return (
                <div key={meal.key}>
                  <div className="mb-1 flex items-center justify-between px-1">
                    <span className="text-sm font-medium text-muted">
                      {meal.icon} {mealLabel(meal.key)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openSaveMeal(mealLabel(meal.key), items)}
                        className="text-[11px] text-accent hover:underline"
                      >
                        {t("save as meal", "sačuvaj kao obrok")}
                      </button>
                      <span className="text-xs text-muted">{mealCals} kcal</span>
                    </div>
                  </div>
                  <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                    {items.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          {/* React escapes this text — stored names can't inject HTML/scripts. */}
                          <p className="truncate text-sm font-medium">{e.name}</p>
                          <p className="text-xs text-muted">
                            {e.protein}p · {e.carbs}c · {e.fat}f
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold">{e.calories}</span>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="text-muted transition-colors hover:text-danger"
                            aria-label={`Delete ${e.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </main>

      {showCalc && (
        <GoalCalculator
          initial={profile}
          onApplied={(g, m, p) => {
            setGoal(g);
            if (m) setMacroGoals(m);
            if (p) setProfile(p);
            setShowCalc(false);
          }}
          onClose={() => setShowCalc(false)}
        />
      )}

      {savingMeal && (
        <SaveMealModal
          initialName={savingMeal.name}
          itemCount={savingMeal.items.length}
          calories={savingMeal.items.reduce((s, it) => s + it.calories, 0)}
          onSave={saveMeal}
          onClose={() => setSavingMeal(null)}
        />
      )}
    </div>
  );
}

function SaveMealModal({
  initialName,
  itemCount,
  calories,
  onSave,
  onClose,
}: {
  initialName: string;
  itemCount: number;
  calories: number;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl border border-border bg-surface p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold">{t("Save as meal 🍱", "Sačuvaj kao obrok 🍱")}</h2>
        <p className="mb-4 text-xs text-muted">
          {itemCount} {t("item", "stavka")}{itemCount === 1 ? "" : t("s", "")} · {calories} kcal — {t("re-add it any day in one tap.", "dodaj ga bilo kog dana jednim dodirom.")}
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("Meal name (e.g. My breakfast)", "Naziv obroka (npr. Moj doručak)")}
          maxLength={80}
          autoFocus
          className="mb-4 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {t("Save meal", "Sačuvaj obrok")}
          </button>
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted">
            {t("Cancel", "Otkaži")}
          </button>
        </div>
      </div>
    </div>
  );
}


function GoalEditor({
  current,
  onSave,
  onCancel,
}: {
  current: number;
  onSave: (n: number) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [val, setVal] = useState(String(current));
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-24 rounded-lg border border-border bg-surface-2 px-2 py-1 text-center text-foreground outline-none focus:border-accent"
        autoFocus
      />
      <button
        onClick={() => {
          const n = Number(val);
          if (Number.isFinite(n) && n >= 500 && n <= 15000) onSave(Math.round(n));
        }}
        className="rounded-lg bg-accent px-2 py-1 font-medium text-black"
      >
        {t("Save", "Sačuvaj")}
      </button>
      <button onClick={onCancel} className="px-1">
        {t("Cancel", "Otkaži")}
      </button>
    </div>
  );
}
