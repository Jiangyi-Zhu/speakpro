import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VocabularyBookClient } from "./client";

export default async function VocabularyBookPage() {
  const session = await auth();

  let words: Array<{
    id: string;
    word: string;
    phonetic: string | null;
    definition: string | null;
    example: string | null;
    mastered: boolean;
    lessonTitle: string | null;
  }> = [];

  if (session?.user?.id) {
    try {
      const items = await prisma.vocabularyItem.findMany({
        where: { userId: session.user.id },
        include: { lesson: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      });

      words = items.map((item) => ({
        id: item.id,
        word: item.word,
        phonetic: item.phonetic,
        definition: item.definition,
        example: item.example,
        mastered: item.mastered,
        lessonTitle: item.lesson?.title || null,
      }));
    } catch {
      // DB error
    }
  }

  return <VocabularyBookClient initialWords={words} />;
}
