// All user input is validated here with Zod before it ever touches the database.
// This is a key part of "no one can put something in an input field and break things":
// if data doesn't match these exact shapes, the request is rejected.
import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(254),
  // Min 8 chars is the practical minimum for a usable password.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200, "Password is too long"),
});

export const mealSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);

export const friendRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
});

// A YYYY-MM-DD date string. Rejects anything that isn't a real calendar day.
export const daySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid day")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid day");

export const foodEntrySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  calories: z.number().int().min(0).max(20000),
  protein: z.number().min(0).max(2000).default(0),
  carbs: z.number().min(0).max(2000).default(0),
  fat: z.number().min(0).max(2000).default(0),
  meal: mealSchema.default("snack"),
  day: daySchema,
});

export const goalSchema = z.object({
  dailyGoal: z.number().int().min(500).max(15000),
});

export const stepsSchema = z.object({
  day: daySchema,
  steps: z.number().int().min(0).max(300000),
});

export const macrosSchema = z.object({
  proteinGoal: z.number().int().min(0).max(1000),
  carbsGoal: z.number().int().min(0).max(2000),
  fatGoal: z.number().int().min(0).max(1000),
});

// A food saved to the personal library (reusable template).
export const savedFoodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  calories: z.number().int().min(0).max(20000),
  protein: z.number().min(0).max(2000).default(0),
  carbs: z.number().min(0).max(2000).default(0),
  fat: z.number().min(0).max(2000).default(0),
});

// A meal (recipe): a named bundle of food items.
export const mealCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        calories: z.number().int().min(0).max(20000),
        protein: z.number().min(0).max(2000).default(0),
        carbs: z.number().min(0).max(2000).default(0),
        fat: z.number().min(0).max(2000).default(0),
        meal: mealSchema.default("snack"),
      }),
    )
    .min(1, "A meal needs at least one item")
    .max(50),
});

// Profile used by the calorie-goal calculator.
export const profileSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.number().int().min(10).max(120),
  heightCm: z.number().min(80).max(260),
  weightKg: z.number().min(25).max(400),
  activity: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  goalType: z.enum(["cut", "maintain", "bulk"]),
});

export type FoodEntryInput = z.infer<typeof foodEntrySchema>;
