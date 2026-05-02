import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expressions = await prisma.expression.findMany({
    where: { userId: session.user.id },
    include: {
      lesson: { select: { id: true, title: true } },
      question: { select: { question: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(expressions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.audioUrl && body.audioUrl.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio too large (max 5MB)" }, { status: 413 });
  }

  const expression = await prisma.expression.create({
    data: {
      userId: session.user.id,
      lessonId: body.lessonId,
      questionId: body.questionId,
      type: body.type || "TEXT",
      content: body.content,
      audioUrl: body.audioUrl,
    },
  });

  return NextResponse.json(expression, { status: 201 });
}
