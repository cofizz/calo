// Looks up calories + macros for a free-text food query like "4 eggs" or
// "200g chicken".
//
// Primary source: our built-in food database (lib/foods-data.ts) — instant, no
// network, understands counts ("4 eggs") and portions ("2 slices bread").
// Fallback: USDA FoodData Central, used only when the food isn't in the built-in
// list, with our own simple quantity parser.
import "server-only";
import { lookupLocalFood } from "./foods-data";

export type NutritionResult = {
  name: string; // friendly label, e.g. "4 Egg" or "Chicken breast (200 g)"
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
};

// "rate_limited" means the USDA fallback is over its quota for now.
export type LookupOutcome = NutritionResult | "rate_limited" | null;

const round1 = (n: number) => Math.round(n * 10) / 10;

export async function lookupNutrition(query: string): Promise<LookupOutcome> {
  const q = query.trim();
  if (q.length < 2) return null;

  // 1) Try the built-in database first — instant and handles counts/portions.
  const local = lookupLocalFood(q);
  if (local) {
    return {
      name: local.display, // clean food name, no amount baked in
      grams: local.grams,
      calories: local.calories,
      protein: local.protein,
      carbs: local.carbs,
      fat: local.fat,
      source: "Built-in food database",
    };
  }

  // 2) Otherwise fall back to the USDA online database.
  return lookupUsda(q);
}

// ---------------------------------------------------------------------------
// USDA fallback (with a simple quantity parser)
// ---------------------------------------------------------------------------

const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1, gram: 1, grams: 1,
  kg: 1000, kilo: 1000, kilos: 1000, kilogram: 1000, kilograms: 1000,
  oz: 28.3495, ounce: 28.3495, ounces: 28.3495,
  lb: 453.592, lbs: 453.592, pound: 453.592, pounds: 453.592,
  ml: 1, l: 1000, liter: 1000, litre: 1000,
};

export function parseQuantity(query: string): { grams: number; term: string } {
  const trimmed = query.trim();
  const m = trimmed.match(/^([\d]+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\.?\s*(.*)$/);
  if (!m) return { grams: 100, term: trimmed };

  const amount = parseFloat(m[1].replace(",", "."));
  const unitRaw = (m[2] ?? "").toLowerCase();
  const rest = m[3]?.trim() ?? "";

  if (Number.isFinite(amount) && UNIT_TO_GRAMS[unitRaw]) {
    return { grams: amount * UNIT_TO_GRAMS[unitRaw], term: rest || trimmed };
  }
  if (Number.isFinite(amount) && !unitRaw && rest) {
    return { grams: amount, term: rest };
  }
  return { grams: 100, term: trimmed };
}

function nutrientPer100(
  food: { foodNutrients?: Array<{ nutrientNumber?: string; value?: number }> },
  number: string,
): number {
  const n = food.foodNutrients?.find((x) => x.nutrientNumber === number);
  return typeof n?.value === "number" ? n.value : 0;
}

async function lookupUsda(query: string): Promise<LookupOutcome> {
  const { grams, term } = parseQuantity(query);
  if (!term) return null;

  const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";
  const search = (dataType: string) =>
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(term)}` +
    `&pageSize=5&dataType=${dataType}&api_key=${encodeURIComponent(apiKey)}`;

  let data: { foods?: Array<Record<string, unknown>> };
  try {
    const res = await fetch(search("Foundation,SR Legacy"), {
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 429) return "rate_limited";
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }

  type Food = {
    description?: string;
    foodNutrients?: Array<{ nutrientNumber?: string; value?: number }>;
  };
  const pickWithCalories = (foods?: Food[]): Food | undefined =>
    foods?.find((f) => nutrientPer100(f, "208") > 0) ?? foods?.[0];

  let food = pickWithCalories(data.foods as Food[] | undefined);

  if (!food || nutrientPer100(food, "208") === 0) {
    try {
      const res2 = await fetch(search("Branded"), { signal: AbortSignal.timeout(8000) });
      if (res2.ok) {
        const d2 = await res2.json();
        const branded = pickWithCalories(d2.foods as Food[] | undefined);
        if (branded && nutrientPer100(branded, "208") > 0) food = branded;
      }
    } catch {
      /* ignore */
    }
  }

  if (!food) return null;

  const factor = grams / 100;
  return {
    name: food.description ?? term, // clean food name, no amount baked in
    grams: round1(grams),
    calories: Math.round(nutrientPer100(food, "208") * factor),
    protein: round1(nutrientPer100(food, "203") * factor),
    carbs: round1(nutrientPer100(food, "205") * factor),
    fat: round1(nutrientPer100(food, "204") * factor),
    source: "USDA FoodData Central",
  };
}
