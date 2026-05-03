import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ExpressionStepClient } from "./client";

export default async function ExpressionStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let questions: Array<{ id: string; question: string; hint: string | null; sampleAnswer: string | null }> = [];
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { published: true },
    });
    if (lesson && (!lesson.published && session?.user?.role !== "ADMIN")) {
      return (
        <ExpressionStepClient
          lessonId={id}
          questions={[]}
          initialSubmissions={{}}
        />
      );
    }

    questions = await prisma.expressionQuestion.findMany({
      where: { lessonId: id },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // DB not connected
  }

  let initialSubmissions: Record<string, string> = {};
  try {
    if (session?.user?.id) {
      const expressions = await prisma.expression.findMany({
        where: { userId: session.user.id, lessonId: id, questionId: { not: null } },
        select: { questionId: true, audioUrl: true },
        orderBy: { createdAt: "desc" },
      });
      for (const e of expressions) {
        if (e.questionId && e.audioUrl && !initialSubmissions[e.questionId]) {
          initialSubmissions[e.questionId] = e.audioUrl;
        }
      }
    }
  } catch {
    // not logged in
  }

  return (
    <ExpressionStepClient
      lessonId={id}
      questions={questions.map((q) => ({
        id: q.id,
        question: q.question,
        hint: q.hint || "",
        sampleAnswer: q.sampleAnswer || "",
      }))}
      initialSubmissions={initialSubmissions}
    />
  );
}
