import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RecordingsClient } from "./client";

export default async function RecordingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let items: Array<{
    id: string;
    audioUrl: string;
    duration: number;
    textEn: string;
    textZh: string;
    lessonId: string;
    lessonTitle: string;
    createdAt: string;
  }> = [];

  try {
    const recordings = await prisma.recording.findMany({
      where: { userId: session.user.id },
      include: {
        lesson: { select: { id: true, title: true } },
        segment: { select: { id: true, textEn: true, textZh: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    items = recordings
      .filter((r) => r.segment !== null)
      .map((r) => ({
        id: r.id,
        audioUrl: r.audioUrl,
        duration: r.duration ?? 0,
        textEn: r.segment!.textEn,
        textZh: r.segment!.textZh || "",
        lessonId: r.lesson.id,
        lessonTitle: r.lesson.title,
        createdAt: r.createdAt.toISOString(),
      }));
  } catch {
    // DB error
  }

  return <RecordingsClient recordings={items} />;
}
