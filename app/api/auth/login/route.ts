import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { credentialsSchema } from "@/lib/validation";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run a password comparison even when the user doesn't exist, so the
  // response time doesn't reveal which emails are registered (timing safety).
  const dummyHash = "$2a$12$abcdefghijklmnopqrstuv0123456789012345678901234567890";
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, dummyHash);

  // Same generic message whether the email or the password is wrong.
  if (!user || !valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
