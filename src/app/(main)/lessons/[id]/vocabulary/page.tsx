import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VocabularyStepClient } from "./client";

export default async function VocabularyStepPage({
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
    textEn: s.textEn,
    textZh: s.textZh || "",
  }));

  let initialWords: string[] = [];
  try {
    const session = await auth();
    if (session?.user?.id) {
      const vocabItems = await prisma.vocabularyItem.findMany({
        where: { userId: session.user.id, lessonId: id },
        select: { word: true },
        orderBy: { createdAt: "asc" },
      });
      initialWords = vocabItems.map((v) => v.word);
    }
  } catch {
    // not logged in
  }

  return (
    <VocabularyStepClient
      lessonId={id}
      segments={segments}
      initialSavedWords={initialWords}
    />
  );
}
