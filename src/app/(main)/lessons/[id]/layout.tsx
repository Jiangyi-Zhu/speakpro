import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { StepNav } from "@/components/lesson/step-nav";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let lesson;
  try {
    lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
  } catch {
    // DB error - fall through to notFound
  }

  if (!lesson) {
    notFound();
  }

  let completedSteps: Record<string, boolean> = {};
  try {
    const session = await auth();
    if (session?.user?.id) {
      const progress = await prisma.userProgress.findUnique({
        where: { userId_lessonId: { userId: session.user.id, lessonId: id } },
      });
      if (progress) {
        completedSteps = {
          video: progress.videoWatched,
          vocabulary: progress.vocabCompleted,
          "word-study": progress.wordStudyCompleted,
          sentences: progress.sentencesCompleted,
          expression: progress.expressionDone,
          summary: progress.summaryGenerated,
        };
      }
    }
  } catch {
    // not logged in
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/lessons"
            className="mb-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            课程列表
          </Link>
          <h1 className="text-lg font-bold text-gray-900">{lesson.title}</h1>
        </div>
      </div>
      <div className="mb-8">
        <StepNav lessonId={id} completedSteps={completedSteps} />
      </div>
      <div>{children}</div>
    </div>
  );
}
