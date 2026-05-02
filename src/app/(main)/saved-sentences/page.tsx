import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SavedSentencesClient } from "./client";

export default async function SavedSentencesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let sentences: Array<{
    id: string;
    segmentId: string;
    textEn: string;
    textZh: string;
    grammarNote: string;
    note: string;
    lessonId: string;
    lessonTitle: string;
    createdAt: string;
  }> = [];

  try {
    const saved = await prisma.savedSentence.findMany({
      where: { userId: session.user.id },
      include: {
        lesson: { select: { id: true, title: true } },
        segment: { select: { id: true, textEn: true, textZh: true, grammarNote: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    sentences = saved.map((s) => ({
      id: s.id,
      segmentId: s.segmentId,
      textEn: s.segment.textEn,
      textZh: s.segment.textZh || "",
      grammarNote: s.segment.grammarNote || "",
      note: s.note || "",
      lessonId: s.lesson.id,
      lessonTitle: s.lesson.title,
      createdAt: s.createdAt.toISOString(),
    }));
  } catch {
    // DB error
  }

  return <SavedSentencesClient initialSentences={sentences} />;
}
