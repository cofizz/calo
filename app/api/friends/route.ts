import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { friendRequestSchema } from "@/lib/validation";
import { getUserProgress } from "@/lib/streak";

// A friendly display name from a user record.
function displayName(u: { name: string | null; email: string }): string {
  return u.name?.trim() || u.email.split("@")[0];
}

// GET /api/friends?today=YYYY-MM-DD
// Returns the streak leaderboard (you + accepted friends) and incoming requests.
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const today =
    new URL(req.url).searchParams.get("today") ?? new Date().toISOString().slice(0, 10);

  // Accepted friendships involving me (either direction).
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      addressee: { select: { id: true, name: true, email: true } },
    },
  });
  const friendUsers = friendships.map((f) =>
    f.requesterId === userId ? f.addressee : f.requester,
  );

  // Me + friends, with each one's streak + today's progress.
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const people = [me, ...friendUsers];
  const leaderboard = await Promise.all(
    people.map(async (u) => {
      const p = await getUserProgress(u.id, today);
      const pct = p && p.goal > 0 ? Math.round((p.todayCalories / p.goal) * 100) : 0;
      return {
        id: u.id,
        name: displayName(u),
        isMe: u.id === userId,
        current: p?.current ?? 0,
        best: p?.best ?? 0,
        todayPct: pct,
        todayMet: p?.todayMet ?? false,
      };
    }),
  );
  leaderboard.sort((a, b) => b.current - a.current || b.best - a.best);

  // Incoming pending requests (people who want to add me).
  const incoming = await prisma.friendship.findMany({
    where: { addresseeId: userId, status: "pending" },
    include: { requester: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({
    leaderboard,
    requests: incoming.map((r) => ({ id: r.id, name: displayName(r.requester) })),
  });
}

// POST /api/friends  body: { email }  -> send a friend request.
export async function POST(req: Request) {
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
  const parsed = friendRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  // Generic-ish: don't hard-confirm account existence, but we do need a target.
  if (!target) {
    return NextResponse.json({ error: "No user with that email" }, { status: 404 });
  }
  if (target.id === userId) {
    return NextResponse.json({ error: "You can't add yourself" }, { status: 400 });
  }

  // Already connected (either direction, any status)?
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: userId },
      ],
    },
  });
  if (existing) {
    // If they already requested me, accept it instead of erroring.
    if (existing.addresseeId === userId && existing.status === "pending") {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted" },
      });
      return NextResponse.json({ ok: true, accepted: true });
    }
    return NextResponse.json(
      { error: existing.status === "accepted" ? "Already friends" : "Request already sent" },
      { status: 409 },
    );
  }

  await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: target.id, status: "pending" },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
