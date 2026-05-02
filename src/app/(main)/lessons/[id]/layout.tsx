import { notFound } from "next/navigation";
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
    lesson = { id, title: "课程加载中..." };
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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
      </div>
      <div className="mb-6">
        <StepNav lessonId={id} completedSteps={completedSteps} />
      </div>
      <div>{children}</div>
    </div>
  );
}
