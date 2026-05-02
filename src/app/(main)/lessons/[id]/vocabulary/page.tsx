import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
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

  return (
    <VocabularyStepClient
      lessonId={id}
      segments={segments}
    />
  );
}
