"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n-context";

type AddInput = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: string;
};

export type Prefill = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  seed: number; // bump to force a re-apply even with identical values
};

const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function AddFoodForm({
  onAdd,
  onSaveToLibrary,
  prefill,
}: {
  onAdd: (input: AddInput) => Promise<boolean>;
  onSaveToLibrary: (food: Omit<AddInput, "meal">) => Promise<void>;
  prefill: Prefill | null;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [food, setFood] = useState(""); // food name, e.g. "chicken" / "eggs"
  const [amount, setAmount] = useState(""); // "200g" or a count like "3"
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [meal, setMeal] = useState<string>("snack");
  const [save, setSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [looking, setLooking] = useState(false);
  const [lookupNote, setLookupNote] = useState<string | null>(null);

  // When a saved food is tapped, open the form pre-filled. Saved names often
  // start with the amount ("60g Whey protein") — split that back into the
  // Amount field so both boxes are populated.
  useEffect(() => {
    if (!prefill) return;
    const { amount: amt, food: fd } = splitAmount(prefill.name);
    setFood(fd);
    setAmount(amt);
    setCalories(String(prefill.calories));
    setProtein(String(prefill.protein));
    setCarbs(String(prefill.carbs));
    setFat(String(prefill.fat));
    setError(null);
    setLookupNote(null);
    setOpen(true);
  }, [prefill]);

  function reset() {
    setFood("");
    setAmount("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setSave(false);
    setError(null);
    setLookupNote(null);
  }

  // Build the entry's display name from the amount + food fields.
  function entryName() {
    return [amount.trim(), food.trim()].filter(Boolean).join(" ");
  }

  // "Look up" — combines amount + food into a query ("3" + "eggs" => "3 eggs")
  // and fills the macro fields from the result.
  async function lookup() {
    if (!food.trim()) {
      setError(t("Type a food first, e.g. chicken or eggs", "Prvo upiši hranu, npr. piletina ili jaja"));
      return;
    }
    const q = [amount.trim(), food.trim()].filter(Boolean).join(" ");
    setError(null);
    setLookupNote(null);
    setLooking(true);
    try {
      const res = await fetch(`/api/nutrition/lookup?q=${encodeURIComponent(q)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("Lookup failed", "Pretraga nije uspela"));
        return;
      }
      const r = data.result;
      setFood(r.name); // tidy, matched name (e.g. "Chicken breast")
      if (!amount.trim()) setAmount(`${r.grams}g`); // show the assumed amount
      setCalories(String(r.calories));
      setProtein(String(r.protein));
      setCarbs(String(r.carbs));
      setFat(String(r.fat));
      setLookupNote(t("Filled in. Adjust if needed.", "Popunjeno. Izmeni ako treba."));
    } catch {
      setError(t("Network error during lookup", "Greška u mreži tokom pretrage"));
    } finally {
      setLooking(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cal = Number(calories);
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fat) || 0;
    if (!food.trim()) return setError(t("Give the food a name", "Daj hrani naziv"));
    if (!Number.isFinite(cal) || cal < 0) return setError(t("Enter valid calories", "Unesi ispravne kalorije"));
    // Don't allow logging a totally empty food.
    if (cal === 0 && p === 0 && c === 0 && f === 0)
      return setError(
        t("Enter calories or macros first", "Prvo unesi kalorije ili makroe"),
      );

    const payload = {
      name: entryName(),
      calories: Math.round(cal),
      protein: p,
      carbs: c,
      fat: f,
    };

    setSaving(true);
    const ok = await onAdd({ ...payload, meal });
    if (ok && save) await onSaveToLibrary(payload);
    setSaving(false);

    if (ok) {
      reset();
      setOpen(false);
    } else {
      setError(t("Could not save — check your inputs", "Nije sačuvano — proveri unose"));
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-accent py-4 text-base font-bold text-black shadow-lg shadow-accent/20 transition-opacity hover:opacity-90"
      >
        ＋ {t("Add food", "Dodaj hranu")}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border border-border bg-surface p-4"
    >
      {/* Food name + amount */}
      <div className="flex gap-2">
        <input
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder={t("Food (e.g. chicken, eggs)", "Hrana (npr. piletina, jaja)")}
          maxLength={120}
          autoFocus
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="200g / 3"
          maxLength={20}
          className="w-24 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-center text-sm outline-none focus:border-accent"
        />
      </div>

      {/* Look up button */}
      <button
        type="button"
        onClick={lookup}
        disabled={looking}
        className="w-full rounded-xl border border-accent/40 bg-accent/10 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
      >
        {looking ? t("Looking up…", "Tražim…") : `🔍 ${t("Look up calories", "Pronađi kalorije")}`}
      </button>
      {lookupNote && <p className="text-xs text-accent">{lookupNote}</p>}

      <NumField label={t("Calories", "Kalorije")} value={calories} onChange={setCalories} placeholder="0" />

      <div className="grid grid-cols-3 gap-2">
        <NumField label={t("Protein (g)", "Proteini (g)")} value={protein} onChange={setProtein} placeholder="0" />
        <NumField label={t("Carbs (g)", "Ugljeni h. (g)")} value={carbs} onChange={setCarbs} placeholder="0" />
        <NumField label={t("Fat (g)", "Masti (g)")} value={fat} onChange={setFat} placeholder="0" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MEALS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMeal(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              meal === m ? "bg-accent text-black" : "bg-surface-2 text-muted"
            }`}
          >
            {{
              breakfast: t("Breakfast", "Doručak"),
              lunch: t("Lunch", "Ručak"),
              dinner: t("Dinner", "Večera"),
              snack: t("Snack", "Užina"),
            }[m]}
          </button>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={save}
          onChange={(e) => setSave(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        {t("Save to my foods for quick re-adding", "Sačuvaj u moju hranu za brzo dodavanje")}
      </label>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? t("Saving…", "Čuvam…") : t("Add", "Dodaj")}
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted"
        >
          {t("Cancel", "Otkaži")}
        </button>
      </div>
    </form>
  );
}

// Split a food name like "60g Whey protein" or "4 Egg" into a leading amount
// ("60g" / "4") and the food name ("Whey protein" / "Egg"). No leading amount
// just returns the whole thing as the food.
function splitAmount(full: string): { amount: string; food: string } {
  const m = full.trim().match(/^(\d+(?:[.,]\d+)?\s*[a-zA-Z]*)\s+(.+)$/);
  if (m) return { amount: m[1].trim(), food: m[2].trim() };
  return { amount: "", food: full.trim() };
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-[11px] font-medium text-muted">{label}</label>
      )}
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
