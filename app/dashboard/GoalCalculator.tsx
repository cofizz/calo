"use client";

import { useState } from "react";
import { ACTIVITY_LABELS, type Activity, type GoalType, type Sex } from "@/lib/calories";

export type Profile = {
  sex: Sex | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activity: Activity | null;
  goalType: GoalType | null;
};

const GOALS: { key: GoalType; label: string; hint: string; icon: string }[] = [
  { key: "cut", label: "Cut", hint: "lose fat", icon: "📉" },
  { key: "maintain", label: "Maintain", hint: "stay same", icon: "⚖️" },
  { key: "bulk", label: "Bulk", hint: "gain muscle", icon: "📈" },
];

export default function GoalCalculator({
  initial,
  onApplied,
  onClose,
}: {
  initial: Profile;
  onApplied: (
    newGoal: number,
    macros?: { protein: number; carbs: number; fat: number },
  ) => void;
  onClose: () => void;
}) {
  const [sex, setSex] = useState<Sex>(initial.sex ?? "male");
  const [age, setAge] = useState(initial.age ? String(initial.age) : "");
  const [height, setHeight] = useState(initial.heightCm ? String(initial.heightCm) : "");
  const [weight, setWeight] = useState(initial.weightKg ? String(initial.weightKg) : "");
  const [activity, setActivity] = useState<Activity>(initial.activity ?? "moderate");
  const [goalType, setGoalType] = useState<GoalType>(initial.goalType ?? "maintain");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function calculate() {
    setError(null);
    const payload = {
      sex,
      age: Number(age),
      heightCm: Number(height),
      weightKg: Number(weight),
      activity,
      goalType,
    };
    if (!age || !height || !weight) return setError("Fill in age, height and weight");

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not calculate");
        return;
      }
      onApplied(
        data.dailyGoal,
        typeof data.protein === "number"
          ? { protein: data.protein, carbs: data.carbs, fat: data.fat }
          : undefined,
      );
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Calculate my goal</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close">
            ✕
          </button>
        </div>

        {/* Sex */}
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 text-sm font-medium">
          {(["male", "female"] as Sex[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSex(s)}
              className={`rounded-lg py-2 capitalize transition-colors ${
                sex === s ? "bg-accent text-black" : "text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Age / height / weight */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <Field label="Age" value={age} onChange={setAge} suffix="yr" />
          <Field label="Height" value={height} onChange={setHeight} suffix="cm" />
          <Field label="Weight" value={weight} onChange={setWeight} suffix="kg" />
        </div>

        {/* Activity */}
        <label className="mb-1 block text-xs font-medium text-muted">Activity level</label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as Activity)}
          className="mb-4 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => (
            <option key={a} value={a}>
              {ACTIVITY_LABELS[a]}
            </option>
          ))}
        </select>

        {/* Goal */}
        <label className="mb-1 block text-xs font-medium text-muted">Goal</label>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGoalType(g.key)}
              className={`rounded-xl border py-3 text-center transition-colors ${
                goalType === g.key
                  ? "border-accent bg-accent/15"
                  : "border-border bg-surface-2"
              }`}
            >
              <div className="text-lg">{g.icon}</div>
              <div className="text-sm font-medium">{g.label}</div>
              <div className="text-[10px] text-muted">{g.hint}</div>
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <button
          onClick={calculate}
          disabled={saving}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Calculating…" : "Calculate & set goal"}
        </button>
        <p className="mt-3 text-center text-[11px] text-muted">
          Estimate via the Mifflin-St Jeor formula. Not medical advice.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center rounded-xl border border-border bg-surface-2 px-2.5 focus-within:border-accent">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 text-sm outline-none"
        />
        <span className="text-xs text-muted">{suffix}</span>
      </div>
    </div>
  );
}
