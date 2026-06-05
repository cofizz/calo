import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { usernameField } from "@/lib/validation";

const schema = z.object({ username: usernameField });

// PATCH /api/username -> claim a username, but ONLY if you don't already have one.
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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid username" },
      { status: 400 },
    );
  }

  // Don't allow changing an existing username — usernames stay stable.
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  if (me?.username) {
    return NextResponse.json({ error: "You already have a username" }, { status: 409 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username: parsed.data.username },
    });
    return NextResponse.json({ ok: true, username: parsed.data.username });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
