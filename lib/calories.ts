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

// Protein per kg of bodyweight + fat as a % of calories, per plan. Bodyweight-
// based protein is how it's actually done — a flat % of calories overshoots
// badly at higher calorie targets (e.g. 250 g protein for an 88 kg cut 🙃).
const MACRO_RULES: Record<GoalType, { proteinPerKg: number; fatPct: number }> = {
  cut: { proteinPerKg: 2.2, fatPct: 0.25 }, // higher protein protects muscle in a deficit
  maintain: { proteinPerKg: 1.8, fatPct: 0.28 },
  bulk: { proteinPerKg: 1.9, fatPct: 0.25 },
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

// Derive daily protein/carbs/fat goals (grams) from the calorie goal, plan and
// (when known) bodyweight. Carbs fill whatever calories are left over.
export function defaultMacros(
  calorieGoal: number,
  goalType: GoalType,
  weightKg?: number | null,
): Macros {
  const r = MACRO_RULES[goalType] ?? MACRO_RULES.maintain;
  const round5 = (n: number) => Math.round(n / 5) * 5;

  // Protein from bodyweight; fall back to ~30% of calories if weight unknown.
  const protein = weightKg ? weightKg * r.proteinPerKg : (calorieGoal * 0.3) / 4;
  // Fat as a share of calories, with a hormone-friendly floor when we have weight.
  const fat = Math.max((calorieGoal * r.fatPct) / 9, weightKg ? weightKg * 0.7 : 0);
  // Carbs = remaining calories.
  const carbs = Math.max((calorieGoal - protein * 4 - fat * 9) / 4, 0);

  return { protein: round5(protein), carbs: round5(carbs), fat: round5(fat) };
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
