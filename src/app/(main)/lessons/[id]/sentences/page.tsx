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
  try {
    const session = await auth();
    if (session?.user?.id) {
      const saved = await prisma.savedSentence.findMany({
        where: { userId: session.user.id, lessonId: id },
        select: { segmentId: true },
      });
      savedSegmentIds = saved.map((s) => s.segmentId);
    }
  } catch {
    // not logged in or DB error
  }

  return (
    <SentencesStepClient
      lessonId={id}
      videoUrl={lesson.videoUrl}
      segments={segments}
      initialSavedSegmentIds={savedSegmentIds}
    />
  );
}
