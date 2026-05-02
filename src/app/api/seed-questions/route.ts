import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== "seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { lessonId, questions } = await req.json();

  await prisma.expressionQuestion.deleteMany({ where: { lessonId } });

  const created = await Promise.all(
    questions.map((q: { question: string; hint?: string; sampleAnswer?: string; sortOrder: number }) =>
      prisma.expressionQuestion.create({
        data: {
          lessonId,
          question: q.question,
          hint: q.hint,
          sampleAnswer: q.sampleAnswer,
          sortOrder: q.sortOrder,
        },
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}
