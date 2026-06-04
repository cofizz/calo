// Daily calorie goal calculator.
//
// 1. BMR (calories burned at rest) via the Mifflin-St Jeor equation.
// 2. TDEE (total daily burn) = BMR x an activity multiplier.
// 3. Goal = TDEE adjusted for the user's intent (cut / maintain / bulk).
//
// These are well-established estimates, not medical advice.

export type Sex = "male" | "female";
export type Activity =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type GoalType = "cut" | "maintain" | "bulk";

export const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2, // little or no exercise
  light: 1.375, // 1-3 days/week
  moderate: 1.55, // 3-5 days/week
  active: 1.725, // 6-7 days/week
  very_active: 1.9, // hard daily training / physical job
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: "Sedentary (little/no exercise)",
  light: "Light (1-3 days/week)",
  moderate: "Moderate (3-5 days/week)",
  active: "Active (6-7 days/week)",
  very_active: "Very active (athlete / physical job)",
};

// kcal/day adjustment for each goal. ~500 kcal ≈ 0.45 kg/week change.
const GOAL_ADJUSTMENT: Record<GoalType, number> = {
  cut: -500,
  maintain: 0,
  bulk: 350,
};

export type CalorieInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goalType: GoalType;
};

export function calcBmr(input: Pick<CalorieInput, "sex" | "age" | "heightCm" | "weightKg">): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

// Default macro split (% of calories) per plan. Protein/carbs = 4 kcal/g, fat = 9.
const MACRO_SPLIT: Record<GoalType, { p: number; c: number; f: number }> = {
  cut: { p: 0.4, c: 0.3, f: 0.3 }, // high protein to keep muscle in a deficit
  maintain: { p: 0.3, c: 0.4, f: 0.3 },
  bulk: { p: 0.3, c: 0.45, f: 0.25 },
};

export type Macros = { protein: number; carbs: number; fat: number };

// Did a day "hit goal" for streak purposes? Plan-aware: on a cut, staying at/under
// the (already-deficit) goal counts; on a bulk you need to reach it; maintain = near.
export function metGoal(
  calories: number,
  goal: number,
  goalType: string | null,
): boolean {
  if (calories <= 0 || goal <= 0) return false;
  const r = calories / goal;
  if (goalType === "cut") return r >= 0.5 && r <= 1.1; // ate enough, stayed under
  if (goalType === "bulk") return r >= 0.9; // hit the surplus
  return r >= 0.9 && r <= 1.1; // maintain: near the target
}

// Derive daily protein/carbs/fat goals (grams) from the calorie goal + plan.
export function defaultMacros(calorieGoal: number, goalType: GoalType): Macros {
  const s = MACRO_SPLIT[goalType] ?? MACRO_SPLIT.maintain;
  const round5 = (n: number) => Math.round(n / 5) * 5;
  return {
    protein: round5((calorieGoal * s.p) / 4),
    carbs: round5((calorieGoal * s.c) / 4),
    fat: round5((calorieGoal * s.f) / 9),
  };
}

export function calcGoal(input: CalorieInput): {
  bmr: number;
  tdee: number;
  goal: number;
} {
  const bmr = calcBmr(input);
  const tdee = bmr * ACTIVITY_FACTORS[input.activity];
  // Never recommend below a safe-ish floor.
  const goal = Math.max(1200, Math.round(tdee + GOAL_ADJUSTMENT[input.goalType]));
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), goal };
}
