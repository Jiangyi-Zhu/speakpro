import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SentencesStepClient } from "./client";

export default async function SentencesStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

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

  if (!lesson || (!lesson.published && session?.user?.role !== "ADMIN")) notFound();

  const segments = lesson.segments.map((s) => ({
    id: s.id,
    index: s.index,
    textEn: s.textEn,
    textZh: s.textZh || "",
    grammarNote: s.grammarNote || "",
    audioUrl: s.audioUrl,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  let savedSegmentIds: string[] = [];
  let initialRecordings: Record<string, string> = {};
  try {
    if (session?.user?.id) {
      const saved = await prisma.savedSentence.findMany({
        where: { userId: session.user.id, lessonId: id },
        select: { segmentId: true },
      });
      savedSegmentIds = saved.map((s) => s.segmentId);

      const recordings = await prisma.recording.findMany({
        where: { userId: session.user.id, lessonId: id, segmentId: { not: null } },
        select: { segmentId: true, audioUrl: true },
        orderBy: { createdAt: "desc" },
      });
      for (const r of recordings) {
        if (r.segmentId && !initialRecordings[r.segmentId]) {
          initialRecordings[r.segmentId] = r.audioUrl;
        }
      }
    }
  } catch {
    // DB error
  }

  return (
    <SentencesStepClient
      lessonId={id}
      videoUrl={lesson.videoUrl}
      segments={segments}
      initialSavedSegmentIds={savedSegmentIds}
      initialRecordings={initialRecordings}
    />
  );
}
