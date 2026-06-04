import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

// Always read fresh so newly added photos show up without a rebuild.
export const dynamic = "force-dynamic";

// Mood prefixes — a photo belongs to a mood if its filename starts with one.
// e.g. "hit-goal-1.jpg", "hit-goal-doggo.png" both map to the "hit-goal" mood.
const MOOD_KEYS = ["under-goal", "near-goal", "hit-goal", "way-over", "over-limit"];
const IMAGE_RE = /\.(jpe?g|png|webp|gif)$/i;

// GET /api/dog -> { "hit-goal": ["hit-goal-1.jpg", ...], ... }
// Lists the available dog photos in /public/dog grouped by mood.
export async function GET() {
  const dir = path.join(process.cwd(), "public", "dog");
  const groups: Record<string, string[]> = Object.fromEntries(
    MOOD_KEYS.map((k) => [k, []]),
  );

  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return NextResponse.json(groups); // folder missing -> all empty
  }

  for (const file of files) {
    if (!IMAGE_RE.test(file)) continue;
    const lower = file.toLowerCase();
    // Match the most specific prefix (way-over before over-limit).
    const key = MOOD_KEYS.find((k) => lower.startsWith(k));
    if (key) groups[key].push(file);
  }

  return NextResponse.json(groups);
}
