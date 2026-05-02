import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { VideoStepClient } from "./client";

export default async function VideoStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let lesson;
  try {
    lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        segments: { orderBy: { index: "asc" } },
      },
    });
  } catch {
    lesson = null;
  }

  if (!lesson) notFound();

  return (
    <VideoStepClient
      lessonId={id}
      videoUrl={lesson.videoUrl}
      segments={lesson.segments.map((s) => ({
        id: s.id,
        index: s.index,
        textEn: s.textEn,
        textZh: s.textZh || "",
        startTime: s.startTime,
        endTime: s.endTime,
      }))}
    />
  );
}
