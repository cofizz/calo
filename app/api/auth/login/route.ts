import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login or password" }, { status: 400 });
  }
  const { identifier, password } = parsed.data;
  const id = identifier.toLowerCase();

  // Look up by email or username (whichever matches).
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: id }, { username: id }] },
  });

  // Always run a password comparison even when the user doesn't exist, so the
  // response time doesn't reveal which emails are registered (timing safety).
  const dummyHash = "$2a$12$abcdefghijklmnopqrstuv0123456789012345678901234567890";
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, dummyHash);

  // Same generic message whether the login or the password is wrong.
  if (!user || !valid) {
    return NextResponse.json(
      { error: "Invalid login or password" },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
