import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const minutes = Math.min(Math.max(Math.round(body.minutes), 0), 60);

  if (minutes <= 0) {
    return NextResponse.json({ ok: true });
  }

  const nowUtc = new Date();
  const todayUtc = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate()));

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastStudyDate: true, streakDays: true },
  });

  let streakUpdate = {};
  if (user) {
    const lastStudy = user.lastStudyDate;
    if (!lastStudy || lastStudy < todayUtc) {
      const yesterdayUtc = new Date(todayUtc);
      yesterdayUtc.setUTCDate(yesterdayUtc.getUTCDate() - 1);

      if (lastStudy && lastStudy >= yesterdayUtc) {
        streakUpdate = { streakDays: user.streakDays + 1 };
      } else {
        streakUpdate = { streakDays: 1 };
      }
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totalMinutes: { increment: minutes },
      lastStudyDate: nowUtc,
      ...streakUpdate,
    },
  });

  return NextResponse.json({ ok: true });
}
