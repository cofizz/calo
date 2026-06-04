import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { macrosSchema } from "@/lib/validation";

// PATCH /api/macros -> manually set this user's protein/carbs/fat goals.
export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = macrosSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid macros" },
      { status: 400 },
    );
  }

  await prisma.user.update({ where: { id: userId }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
