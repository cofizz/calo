import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate + normalise input. Anything malformed is rejected here.
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { email, username, password } = parsed.data;

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Unique-constraint violation = email or username already taken.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = (err.meta?.target as string[] | undefined)?.join(",") ?? "";
      const field = target.includes("username") ? "username" : "email";
      return NextResponse.json(
        { error: `That ${field} is already taken` },
        { status: 409 },
      );
    }
    console.error("signup error", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
