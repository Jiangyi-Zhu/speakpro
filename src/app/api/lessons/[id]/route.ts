import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      segments: { orderBy: { index: "asc" } },
      questions: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!lesson.published && session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      coverImage: body.coverImage,
      videoUrl: body.videoUrl,
      duration: body.duration,
      difficulty: body.difficulty,
      category: body.category,
      tags: body.tags !== undefined ? JSON.stringify(body.tags) : undefined,
      published: body.published,
      sortOrder: body.sortOrder,
    },
  });

  return NextResponse.json(lesson);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
