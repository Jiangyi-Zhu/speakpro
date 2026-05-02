import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = req.nextUrl.searchParams.get("lessonId");

  const where: { userId: string; lessonId?: string } = {
    userId: session.user.id,
  };
  if (lessonId) where.lessonId = lessonId;

  const recordings = await prisma.recording.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      lesson: { select: { id: true, title: true } },
      segment: { select: { id: true, index: true, textEn: true } },
    },
  });

  return NextResponse.json(recordings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.audioUrl && body.audioUrl.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio too large (max 5MB)" }, { status: 413 });
  }

  const recording = await prisma.recording.create({
    data: {
      userId: session.user.id,
      lessonId: body.lessonId,
      segmentId: body.segmentId,
      audioUrl: body.audioUrl,
      duration: body.duration,
    },
  });

  return NextResponse.json(recording, { status: 201 });
}
