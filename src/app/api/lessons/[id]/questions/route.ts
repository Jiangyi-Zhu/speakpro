import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const questions: Array<{ question: string; hint?: string; sortOrder: number }> =
    await req.json();

  await prisma.expressionQuestion.deleteMany({ where: { lessonId: id } });

  const created = await Promise.all(
    questions.map((q) =>
      prisma.expressionQuestion.create({
        data: {
          lessonId: id,
          question: q.question,
          hint: q.hint,
          sortOrder: q.sortOrder,
        },
      })
    )
  );

  return NextResponse.json(created);
}
