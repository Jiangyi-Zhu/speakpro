import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ExpressionStepClient } from "./client";

export default async function ExpressionStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let questions: Array<{ id: string; question: string; hint: string | null }> = [];
  try {
    questions = await prisma.expressionQuestion.findMany({
      where: { lessonId: id },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // DB not connected
  }

  return (
    <ExpressionStepClient
      lessonId={id}
      questions={questions.map((q) => ({
        id: q.id,
        question: q.question,
        hint: q.hint || "",
      }))}
    />
  );
}
