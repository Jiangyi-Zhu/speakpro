import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SummaryStepClient } from "./client";

export default async function SummaryStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let lessonTitle = "";
  let segmentCount = 0;
  let wordsLearned = 0;
  let recordingsMade = 0;
  let expressionDone = false;
  let savedCount = 0;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { title: true, _count: { select: { segments: true } } },
    });
    lessonTitle = lesson?.title || "";
    segmentCount = lesson?._count.segments || 0;

    if (session?.user?.id) {
      wordsLearned = await prisma.vocabularyItem.count({
        where: { userId: session.user.id, lessonId: id },
      });

      recordingsMade = await prisma.recording.count({
        where: { userId: session.user.id, lessonId: id },
      });

      savedCount = await prisma.savedSentence.count({
        where: { userId: session.user.id, lessonId: id },
      });

      const progress = await prisma.userProgress.findUnique({
        where: { userId_lessonId: { userId: session.user.id, lessonId: id } },
      });
      expressionDone = progress?.expressionDone || false;
    }
  } catch {
    // DB error
  }

  return (
    <SummaryStepClient
      lessonId={id}
      lessonTitle={lessonTitle}
      wordsLearned={wordsLearned}
      totalSentences={segmentCount}
      savedSentences={savedCount}
      recordingsMade={recordingsMade}
      expressionDone={expressionDone}
    />
  );
}
