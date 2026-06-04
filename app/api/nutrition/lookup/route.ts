import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { lookupNutrition } from "@/lib/nutrition";

// GET /api/nutrition/lookup?q=200g chicken
// Returns scaled calories + macros for the query, or 404 if nothing is found.
export async function GET(req: Request) {
  // Require login so this can't be used as an open proxy to the external API.
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json({ error: "Type something to search" }, { status: 400 });
  }

  const result = await lookupNutrition(q);

  if (result === "rate_limited") {
    return NextResponse.json(
      {
        error:
          "Food database is busy (free DEMO key limit). Add your own free USDA key to .env to fix this.",
      },
      { status: 503 },
    );
  }
  if (!result) {
    return NextResponse.json(
      { error: "No match found — try a simpler name, e.g. \"200g chicken\"" },
      { status: 404 },
    );
  }

  return NextResponse.json({ result });
}
