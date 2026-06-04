import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { credentialsSchema } from "@/lib/validation";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate + normalise input. Anything malformed is rejected here.
  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Unique-constraint violation = email already registered.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }
    console.error("signup error", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
