import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// GET /api/users -> usernames to suggest when adding a friend.
// Excludes yourself and anyone you already have a friendship/request with.
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  const connected = new Set<string>([userId]);
  for (const f of friendships) {
    connected.add(f.requesterId);
    connected.add(f.addresseeId);
  }

  const users = await prisma.user.findMany({
    where: { username: { not: null }, id: { notIn: Array.from(connected) } },
    select: { username: true, name: true },
    orderBy: { username: "asc" },
    take: 300,
  });

  return NextResponse.json({
    users: users.map((u) => ({ username: u.username, name: u.name })),
  });
}
