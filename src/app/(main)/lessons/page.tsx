import Link from "next/link";
import { Play, Clock, CheckCircle, ArrowRight } from "lucide-react";
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

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  let lessons: Awaited<ReturnType<typeof prisma.lesson.findMany>> = [];
  let completedLessonIds = new Set<string>();
  let isLoggedIn = false;

  try {
    lessons = await prisma.lesson.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });

    const session = await auth();
    isLoggedIn = !!session?.user;
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">全部课程</h1>
        <p className="mt-2 text-sm text-gray-400">
          选择一个课程开始你的英语学习之旅
        </p>
      </div>

      {!isLoggedIn && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm text-brand-800">登录后可保存学习进度、生词和录音</p>
          <Link
            href="/login"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            登录
          </Link>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Play className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="mb-1 text-base font-medium text-gray-900">
            暂无课程
          </h3>
          <p className="text-sm text-gray-500">
            课程正在准备中，敬请期待
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="group flex items-center gap-5 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5"
            >
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-36">
                {lesson.coverImage ? (
                  <img
                    src={lesson.coverImage}
                    alt={lesson.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Play className="h-8 w-8 text-gray-300 transition-colors group-hover:text-brand-500" />
                  </div>
                )}
                {completedLessonIds.has(lesson.id) && (
                  <div className="absolute right-1.5 top-1.5 rounded-full bg-green-500 p-0.5">
                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[lesson.difficulty]}`}
                  >
                    {difficultyLabel[lesson.difficulty]}
                  </span>
                  {lesson.category && (
                    <span className="text-xs text-gray-400">
                      {lesson.category}
                    </span>
                  )}
                </div>
                <h3 className="mb-1 font-bold text-gray-900 group-hover:text-brand-600">
                  {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="line-clamp-1 text-sm text-gray-400">
                    {lesson.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  {lesson.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.ceil(lesson.duration / 60)} 分钟
                    </span>
                  )}
                  <span>5 步学习</span>
                </div>
              </div>
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-brand-500 sm:block" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
