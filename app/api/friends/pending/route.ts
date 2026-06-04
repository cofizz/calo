import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// GET /api/friends/pending -> count of incoming friend requests (for the badge).
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const count = await prisma.friendship.count({
    where: { addresseeId: userId, status: "pending" },
  });
  return NextResponse.json({ count });
}
