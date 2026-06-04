"use client";

import { useState } from "react";
import { type Activity, type GoalType, type Sex } from "@/lib/calories";
import { useI18n } from "../i18n-context";

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
    profile?: Profile,
  ) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const activityLabels: Record<Activity, string> = {
    sedentary: t("Sedentary (little/no exercise)", "Sedentaran (malo/nimalo vežbanja)"),
    light: t("Light (1-3 days/week)", "Lagano (1-3 dana/nedeljno)"),
    moderate: t("Moderate (3-5 days/week)", "Umereno (3-5 dana/nedeljno)"),
    active: t("Active (6-7 days/week)", "Aktivno (6-7 dana/nedeljno)"),
    very_active: t("Very active (athlete / physical job)", "Veoma aktivno (sportista / fizički posao)"),
  };
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
    const payload: Profile = {
      sex,
      age: Number(age),
      heightCm: Number(height),
      weightKg: Number(weight),
      activity,
      goalType,
    };
    if (!age || !height || !weight) return setError(t("Fill in age, height and weight", "Popuni godine, visinu i težinu"));

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("Could not calculate", "Nije moguće izračunati"));
        return;
      }
      onApplied(
        data.dailyGoal,
        typeof data.protein === "number"
          ? { protein: data.protein, carbs: data.carbs, fat: data.fat }
          : undefined,
        payload, // so the dashboard remembers these inputs for next time
      );
    } catch {
      setError(t("Network error", "Greška u mreži"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("Calculate my goal", "Izračunaj moj cilj")}</h2>
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
              className={`rounded-lg py-2 transition-colors ${
                sex === s ? "bg-accent text-black" : "text-muted"
              }`}
            >
              {s === "male" ? t("Male", "Muško") : t("Female", "Žensko")}
            </button>
          ))}
        </div>

        {/* Age / height / weight */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <Field label={t("Age", "Godine")} value={age} onChange={setAge} suffix={t("yr", "god")} />
          <Field label={t("Height", "Visina")} value={height} onChange={setHeight} suffix="cm" />
          <Field label={t("Weight", "Težina")} value={weight} onChange={setWeight} suffix="kg" />
        </div>

        {/* Activity */}
        <label className="mb-1 block text-xs font-medium text-muted">{t("Activity level", "Nivo aktivnosti")}</label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as Activity)}
          className="mb-4 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {(Object.keys(activityLabels) as Activity[]).map((a) => (
            <option key={a} value={a}>
              {activityLabels[a]}
            </option>
          ))}
        </select>

        {/* Goal */}
        <label className="mb-1 block text-xs font-medium text-muted">{t("Goal", "Cilj")}</label>
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
              <div className="text-sm font-medium">
                {g.key === "cut" ? t("Cut", "Skidanje") : g.key === "bulk" ? t("Bulk", "Masa") : t("Maintain", "Održavanje")}
              </div>
              <div className="text-[10px] text-muted">
                {g.key === "cut" ? t("lose fat", "gubi salo") : g.key === "bulk" ? t("gain muscle", "dobij mišiće") : t("stay same", "ostani isti")}
              </div>
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <button
          onClick={calculate}
          disabled={saving}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? t("Calculating…", "Računam…") : t("Calculate & set goal", "Izračunaj i postavi cilj")}
        </button>
        <p className="mt-3 text-center text-[11px] text-muted">
          {t("Estimate via the Mifflin-St Jeor formula. Not medical advice.", "Procena po Mifflin-St Jeor formuli. Nije medicinski savet.")}
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
