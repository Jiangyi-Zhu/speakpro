import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.vocabularyItem.findMany({
    where: { userId: session.user.id },
    include: { lesson: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const item = await prisma.vocabularyItem.upsert({
    where: {
      userId_word: {
        userId: session.user.id,
        word: body.word,
      },
    },
    update: {
      definition: body.definition,
      phonetic: body.phonetic,
      example: body.example,
      lessonId: body.lessonId,
    },
    create: {
      userId: session.user.id,
      word: body.word,
      definition: body.definition,
      phonetic: body.phonetic,
      example: body.example,
      lessonId: body.lessonId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const item = await prisma.vocabularyItem.updateMany({
    where: { id: body.id, userId: session.user.id },
    data: { mastered: body.mastered },
  });

  if (item.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  await prisma.vocabularyItem.deleteMany({
    where: { id: body.id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
