import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const lessonId = formData.get("lessonId") as string;
  const segmentId = formData.get("segmentId") as string;
  const duration = parseFloat(formData.get("duration") as string) || 0;

  if (!file || !lessonId || !segmentId) {
    return NextResponse.json(
      { error: "file, lessonId, segmentId required" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "audio/webm";
  const audioUrl = `data:${mimeType};base64,${base64}`;

  const recording = await prisma.recording.create({
    data: {
      userId: session.user.id,
      lessonId,
      segmentId,
      audioUrl,
      duration,
    },
  });

  return NextResponse.json(
    { id: recording.id, duration: recording.duration },
    { status: 201 }
  );
}
