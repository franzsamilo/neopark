import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

async function requireSuperAdmin() {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  const { userId, role } = await request.json();
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Missing userId or role" },
      { status: 400 }
    );
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
