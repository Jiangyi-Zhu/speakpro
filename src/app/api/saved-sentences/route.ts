import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedSentence.findMany({
    where: { userId: session.user.id },
    include: {
      lesson: { select: { id: true, title: true } },
      segment: { select: { id: true, textEn: true, textZh: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(saved);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const saved = await prisma.savedSentence.upsert({
    where: {
      userId_segmentId: {
        userId: session.user.id,
        segmentId: body.segmentId,
      },
    },
    update: { note: body.note },
    create: {
      userId: session.user.id,
      lessonId: body.lessonId,
      segmentId: body.segmentId,
      note: body.note,
    },
  });

  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { segmentId } = await req.json();

  await prisma.savedSentence.delete({
    where: {
      userId_segmentId: {
        userId: session.user.id,
        segmentId,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
