import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseSubtitle } from "@/lib/subtitle-parser";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const language = (formData.get("language") as string) || "en";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const content = await file.text();
  const format = file.name.endsWith(".vtt") ? "vtt" : "srt";
  const entries = parseSubtitle(content, format);

  if (entries.length === 0) {
    return NextResponse.json({ error: "No subtitles found in file" }, { status: 400 });
  }

  // Check if lesson exists
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (language === "en") {
    // Delete existing segments and create new ones from English subtitle
    await prisma.lessonSegment.deleteMany({ where: { lessonId: id } });

    const segments = await prisma.$transaction(
      entries.map((entry, i) =>
        prisma.lessonSegment.create({
          data: {
            lessonId: id,
            index: i,
            textEn: entry.text,
            startTime: entry.startTime,
            endTime: entry.endTime,
          },
        })
      )
    );

    return NextResponse.json({
      message: `Imported ${segments.length} English segments`,
      count: segments.length,
    });
  } else if (language === "zh") {
    // Add Chinese translations to existing segments by matching index
    const existing = await prisma.lessonSegment.findMany({
      where: { lessonId: id },
      orderBy: { index: "asc" },
    });

    let updated = 0;
    for (let i = 0; i < Math.min(entries.length, existing.length); i++) {
      await prisma.lessonSegment.update({
        where: { id: existing[i].id },
        data: { textZh: entries[i].text },
      });
      updated++;
    }

    return NextResponse.json({
      message: `Updated ${updated} segments with Chinese translations`,
      count: updated,
    });
  }

  return NextResponse.json({ error: "Invalid language parameter" }, { status: 400 });
}
