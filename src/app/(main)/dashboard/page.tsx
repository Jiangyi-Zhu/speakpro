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
  let recentAchievements: Array<{ icon: string; description: string }> = [];
  let achievementProgress = { unlocked: 0, total: 0 };

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

      const totalAchievements = await prisma.achievement.count();
      const unlockedCount = await prisma.userAchievement.count({
        where: { userId: session.user.id },
      });
      const recentUA = await prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: { achievement: { select: { icon: true, description: true } } },
        orderBy: { unlockedAt: "desc" },
        take: 4,
      });
      achievementProgress = { unlocked: unlockedCount, total: totalAchievements };
      recentAchievements = recentUA.map((ua) => ({
        icon: ua.achievement.icon,
        description: ua.achievement.description,
      }));
    } catch {
      // DB not connected or user not found
    }
  }

  const statItems = [
    { icon: Flame, label: "连续打卡", value: `${stats.streak} 天`, color: "text-orange-500 bg-orange-50" },
    { icon: Clock, label: "学习时长", value: `${stats.totalMinutes} 分钟`, color: "text-blue-500 bg-blue-50" },
    { icon: BookOpen, label: "完成课程", value: `${stats.lessonsCompleted} 课`, color: "text-green-500 bg-green-50" },
    { icon: Award, label: "掌握词汇", value: `${stats.wordsLearned} 词`, color: "text-purple-500 bg-purple-50" },
  ];

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {session?.user?.name ? `${session.user.name}，欢迎回来` : "学习中心"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">每天进步一点点</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statItems.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200/60 bg-white shadow-sm p-5">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {recentLessons.length > 0 ? "继续学习" : "开始学习"}
          </h2>
          <Link
            href="/lessons"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            全部课程
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentLessons.length === 0 ? (
          <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="mb-4 text-sm text-gray-500">还没有开始学习</p>
            <Link
              href="/lessons"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              浏览课程
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}/${stepPaths[lesson.step] || "video"}`}
                className="flex items-center justify-between rounded-2xl border border-gray-200/60 bg-white shadow-sm p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <Play className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lesson.title}</p>
                    <p className="text-xs text-gray-500">
                      {lesson.completed
                        ? "已完成"
                        : `进行中 · ${stepLabels[lesson.step] || "Step " + lesson.step}`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Preview */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">成就</h2>
          <Link
            href="/achievements"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentAchievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {recentAchievements.map((a, i) => (
              <div
                key={i}
                className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center"
              >
                <span className="text-2xl">{a.icon}</span>
                <p className="mt-1 text-xs font-medium text-gray-700">{a.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm p-6 text-center">
            <Award className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">完成学习任务解锁成就</p>
          </div>
        )}
        {achievementProgress.total > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>进度</span>
              <span>{achievementProgress.unlocked}/{achievementProgress.total}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-yellow-500"
                style={{
                  width: `${(achievementProgress.unlocked / achievementProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
