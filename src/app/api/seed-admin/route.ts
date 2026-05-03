import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ONE_TIME_TOKEN = "speakpro-init-2026-05-03-xK9mQ";

export async function POST(req: NextRequest) {
  const { email, token } = await req.json();

  if (token !== ONE_TIME_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
