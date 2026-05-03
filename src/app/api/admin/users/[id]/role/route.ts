import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (role !== "ADMIN" && role !== "USER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { error: "不能降级自己的管理员权限" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
