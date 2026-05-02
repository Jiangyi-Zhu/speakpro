import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/achievements";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = req.nextUrl.searchParams.get("lessonId");

  const where: { userId: string; lessonId?: string } = {
    userId: session.user.id,
  };
  if (lessonId) where.lessonId = lessonId;

  const progress = await prisma.userProgress.findMany({ where });

  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: body.lessonId,
      },
    },
    update: {
      step: body.step,
      videoWatched: body.videoWatched === true ? true : undefined,
      vocabCompleted: body.vocabCompleted === true ? true : undefined,
      wordStudyCompleted: body.wordStudyCompleted === true ? true : undefined,
      sentencesCompleted: body.sentencesCompleted === true ? true : undefined,
      expressionDone: body.expressionDone === true ? true : undefined,
      summaryGenerated: body.summaryGenerated === true ? true : undefined,
      completed: body.completed === true ? true : undefined,
      completedAt: body.completed === true ? new Date() : undefined,
    },
    create: {
      userId: session.user.id,
      lessonId: body.lessonId,
      step: body.step || 1,
      videoWatched: body.videoWatched === true,
      vocabCompleted: body.vocabCompleted === true,
      wordStudyCompleted: body.wordStudyCompleted === true,
      sentencesCompleted: body.sentencesCompleted === true,
      expressionDone: body.expressionDone === true,
      summaryGenerated: body.summaryGenerated === true,
    },
  });

  checkAndAwardAchievements(session.user.id).catch(() => {});

  return NextResponse.json(progress);
}
