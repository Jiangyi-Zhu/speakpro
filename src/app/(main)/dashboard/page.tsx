import Link from "next/link";
import { BookOpen, Flame, Clock, Award, ArrowRight, Play } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  let stats = { streak: 0, totalMinutes: 0, lessonsCompleted: 0, wordsLearned: 0 };
  let recentLessons: Array<{
    id: string;
    title: string;
    difficulty: string;
    step: number;
    completed: boolean;
  }> = [];

  if (session?.user?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { streakDays: true, totalMinutes: true },
      });

      const progressCount = await prisma.userProgress.count({
        where: { userId: session.user.id, completed: true },
      });

      const vocabCount = await prisma.vocabularyItem.count({
        where: { userId: session.user.id },
      });

      stats = {
        streak: user?.streakDays || 0,
        totalMinutes: user?.totalMinutes || 0,
        lessonsCompleted: progressCount,
        wordsLearned: vocabCount,
      };

      const progressList = await prisma.userProgress.findMany({
        where: { userId: session.user.id },
        include: { lesson: { select: { id: true, title: true, difficulty: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });

      recentLessons = progressList.map((p) => ({
        id: p.lesson.id,
        title: p.lesson.title,
        difficulty: p.lesson.difficulty,
        step: p.step,
        completed: p.completed,
      }));
    } catch {
      // DB not connected or user not found
    }
  }

  const stepLabels: Record<number, string> = {
    1: "视频学习",
    2: "词汇预习",
    3: "句子跟读",
    4: "自由表达",
    5: "学习总结",
  };

  const stepPaths: Record<number, string> = {
    1: "video",
    2: "vocabulary",
    3: "sentences",
    4: "expression",
    5: "summary",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {session?.user?.name ? `${session.user.name}，` : ""}欢迎回来
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {stats.streak > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1.5 text-sm font-semibold text-orange-600">
              <Flame className="h-4 w-4" />
              {stats.streak} 天连续
            </div>
          )}
          <span className="text-sm text-gray-400">
            {stats.totalMinutes > 0
              ? `累计学习 ${stats.totalMinutes} 分钟`
              : "开始你的第一课吧"}
          </span>
        </div>
      </div>

      {/* Continue Learning */}
      {recentLessons.length > 0 ? (
        <div className="mb-8">
          <Link
            href={`/lessons/${recentLessons[0].id}/${stepPaths[recentLessons[0].step] || "video"}`}
            className="group block rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="mb-1 text-sm font-semibold text-brand-600">继续学习</p>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {recentLessons[0].title}
            </h2>
            <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${(recentLessons[0].step / 5) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {recentLessons[0].completed
                  ? "已完成"
                  : `进行中 · ${stepLabels[recentLessons[0].step] || ""}`}
              </p>
              <span className="text-sm font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                继续 →
              </span>
            </div>
          </Link>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <BookOpen className="h-7 w-7 text-brand-500" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900">开始你的第一课</h2>
          <p className="mb-6 text-sm text-gray-400">
            通过真实视频练出地道职场英语
          </p>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            浏览课程
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen className="h-4 w-4 text-gray-300" />
          <span>
            <strong className="text-gray-900">{stats.lessonsCompleted}</strong>{" "}
            课完成
          </span>
        </div>
        <div className="hidden h-4 w-px bg-gray-200 sm:block" />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Award className="h-4 w-4 text-gray-300" />
          <span>
            <strong className="text-gray-900">{stats.wordsLearned}</strong>{" "}
            个词汇
          </span>
        </div>
        {stats.totalMinutes > 0 && (
          <>
            <div className="hidden h-4 w-px bg-gray-200 sm:block" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4 text-gray-300" />
              <span>
                <strong className="text-gray-900">{stats.totalMinutes}</strong>{" "}
                分钟
              </span>
            </div>
          </>
        )}
      </div>

      {/* Browse All Courses */}
      <Link
        href="/lessons"
        className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
            <Play className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">全部课程</p>
            <p className="text-xs text-gray-400">浏览更多学习内容</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-300" />
      </Link>
    </div>
  );
}
