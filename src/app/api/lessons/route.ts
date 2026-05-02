import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      duration: true,
      difficulty: true,
      category: true,
      tags: true,
    },
  });

  return NextResponse.json(lessons);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const lesson = await prisma.lesson.create({
    data: {
      title: body.title,
      description: body.description,
      coverImage: body.coverImage,
      videoUrl: body.videoUrl,
      duration: body.duration,
      difficulty: body.difficulty || "INTERMEDIATE",
      category: body.category,
      tags: JSON.stringify(body.tags || []),
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
