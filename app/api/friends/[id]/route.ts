import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// PATCH /api/friends/:id  -> accept an incoming request (only the addressee can).
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;

  // Only the addressee of a pending request may accept it.
  const result = await prisma.friendship.updateMany({
    where: { id, addresseeId: userId, status: "pending" },
    data: { status: "accepted" },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/friends/:id  -> decline a request or remove a friend.
// Allowed for either side of the friendship.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;

  const result = await prisma.friendship.deleteMany({
    where: { id, OR: [{ requesterId: userId }, { addresseeId: userId }] },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
