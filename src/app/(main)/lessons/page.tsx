import Link from "next/link";
import { Play, Clock, BarChart3, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const difficultyLabel: Record<string, string> = {
  BEGINNER: "入门",
  INTERMEDIATE: "中级",
  ADVANCED: "高级",
};

const difficultyColor: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-orange-100 text-orange-700",
};

export default async function LessonsPage() {
  let lessons: Awaited<ReturnType<typeof prisma.lesson.findMany>> = [];
  let completedLessonIds = new Set<string>();

  try {
    lessons = await prisma.lesson.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });

    const session = await auth();
    if (session?.user?.id) {
      const progress = await prisma.userProgress.findMany({
        where: { userId: session.user.id, completed: true },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(progress.map((p) => p.lessonId));
    }
  } catch {
    // DB not connected yet — show empty state
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">全部课程</h1>
        <p className="mt-1 text-sm text-gray-500">
          选择一个课程开始你的英语学习之旅
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Play className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="mb-1 text-base font-medium text-gray-900">
            暂无课程
          </h3>
          <p className="text-sm text-gray-500">
            课程正在准备中，敬请期待
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-blue-200 hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100">
                {lesson.coverImage ? (
                  <img
                    src={lesson.coverImage}
                    alt={lesson.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Play className="h-10 w-10 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                  <div className="rounded-full bg-white/90 p-3 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                {completedLessonIds.has(lesson.id) && (
                  <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[lesson.difficulty]}`}
                  >
                    {difficultyLabel[lesson.difficulty]}
                  </span>
                  {lesson.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {lesson.category}
                    </span>
                  )}
                </div>
                <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600">
                  {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                    {lesson.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {lesson.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.ceil(lesson.duration / 60)} 分钟
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />5 步学习
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
