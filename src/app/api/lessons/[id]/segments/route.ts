import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const segments = await prisma.lessonSegment.findMany({
    where: { lessonId: id },
    orderBy: { index: "asc" },
  });

  return NextResponse.json(segments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (Array.isArray(body)) {
    const segments = await prisma.$transaction(
      body.map((seg: { index: number; textEn: string; textZh?: string; grammarNote?: string; startTime?: number; endTime?: number }, i: number) =>
        prisma.lessonSegment.create({
          data: {
            lessonId: id,
            index: seg.index ?? i,
            textEn: seg.textEn,
            textZh: seg.textZh,
            grammarNote: seg.grammarNote,
            startTime: seg.startTime,
            endTime: seg.endTime,
          },
        })
      )
    );
    return NextResponse.json(segments, { status: 201 });
  }

  const segment = await prisma.lessonSegment.create({
    data: {
      lessonId: id,
      index: body.index,
      textEn: body.textEn,
      textZh: body.textZh,
      grammarNote: body.grammarNote,
      startTime: body.startTime,
      endTime: body.endTime,
    },
  });

  return NextResponse.json(segment, { status: 201 });
}
