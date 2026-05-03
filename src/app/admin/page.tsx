import {
  GraduationCap,
  Users,
  BookOpen,
  Mic,
  MessageSquare,
  Bookmark,
  Clock,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  let stats = {
    lessonCount: 0,
    publishedCount: 0,
    userCount: 0,
    progressCount: 0,
    completedCount: 0,
    vocabCount: 0,
    recordingCount: 0,
    expressionCount: 0,
    savedSentenceCount: 0,
    totalStudyMinutes: 0,
  };

  let recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
  }> = [];

  let recentProgress: Array<{
    user: { name: string | null; email: string };
    lesson: { title: string };
    step: number;
    completed: boolean;
    updatedAt: Date;
  }> = [];

  let lessonStats: Array<{
    id: string;
    title: string;
    published: boolean;
    _count: { progress: number };
    completedCount: number;
  }> = [];

  try {
    const [
      lessonCount,
      publishedCount,
      userCount,
      progressCount,
      completedCount,
      vocabCount,
      recordingCount,
      expressionCount,
      savedSentenceCount,
      studyTimeAgg,
    ] = await Promise.all([
      prisma.lesson.count(),
      prisma.lesson.count({ where: { published: true } }),
      prisma.user.count(),
      prisma.userProgress.count(),
      prisma.userProgress.count({ where: { completed: true } }),
      prisma.vocabularyItem.count(),
      prisma.recording.count(),
      prisma.expression.count(),
      prisma.savedSentence.count(),
      prisma.user.aggregate({ _sum: { totalMinutes: true } }),
    ]);

    stats = {
      lessonCount,
      publishedCount,
      userCount,
      progressCount,
      completedCount,
      vocabCount,
      recordingCount,
      expressionCount,
      savedSentenceCount,
      totalStudyMinutes: studyTimeAgg._sum.totalMinutes || 0,
    };

    recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    });

    recentProgress = await prisma.userProgress.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        user: { select: { name: true, email: true } },
        lesson: { select: { title: true } },
        step: true,
        completed: true,
        updatedAt: true,
      },
    });

    const lessons = await prisma.lesson.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        published: true,
        _count: { select: { progress: true } },
      },
    });

    const completedCounts = await prisma.userProgress.groupBy({
      by: ["lessonId"],
      where: { completed: true },
      _count: true,
    });
    const completedMap = new Map(
      completedCounts.map((c) => [c.lessonId, c._count])
    );

    lessonStats = lessons.map((l) => ({
      ...l,
      completedCount: completedMap.get(l.id) || 0,
    }));
  } catch {
    // DB error
  }

  const stepLabels = ["视频", "词汇", "学词", "跟读", "表达", "总结"];

  const cards = [
    {
      icon: GraduationCap,
      label: "课程",
      value: `${stats.publishedCount} / ${stats.lessonCount}`,
      sub: "已发布 / 总数",
    },
    {
      icon: Users,
      label: "注册用户",
      value: stats.userCount.toString(),
      sub: "",
    },
    {
      icon: TrendingUp,
      label: "学习人次",
      value: stats.progressCount.toString(),
      sub: `${stats.completedCount} 人次完成`,
    },
    {
      icon: Clock,
      label: "总学习时长",
      value:
        stats.totalStudyMinutes >= 60
          ? `${Math.round(stats.totalStudyMinutes / 60)}h`
          : `${stats.totalStudyMinutes}min`,
      sub: `${stats.totalStudyMinutes} 分钟`,
    },
    {
      icon: Mic,
      label: "录音数",
      value: stats.recordingCount.toString(),
      sub: "",
    },
    {
      icon: MessageSquare,
      label: "表达数",
      value: stats.expressionCount.toString(),
      sub: "",
    },
    {
      icon: BookOpen,
      label: "收藏词汇",
      value: stats.vocabCount.toString(),
      sub: "",
    },
    {
      icon: Bookmark,
      label: "收藏句子",
      value: stats.savedSentenceCount.toString(),
      sub: "",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">管理概览</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 p-5"
          >
            <card.icon className="mb-3 h-5 w-5 text-gray-400" />
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500">{card.label}</div>
            {card.sub && (
              <div className="mt-0.5 text-xs text-gray-400">{card.sub}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 课程完成率 */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            课程完成率
          </h2>
          {lessonStats.length === 0 ? (
            <p className="text-sm text-gray-500">暂无课程</p>
          ) : (
            <div className="space-y-3">
              {lessonStats.map((l) => {
                const rate =
                  l._count.progress > 0
                    ? Math.round(
                        (l.completedCount / l._count.progress) * 100
                      )
                    : 0;
                return (
                  <div key={l.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {l.title}
                        {!l.published && (
                          <span className="ml-1.5 text-xs text-gray-400">
                            (草稿)
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums text-gray-500">
                        {l.completedCount}/{l._count.progress} 完成
                        {l._count.progress > 0 && ` (${rate}%)`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 最近学习动态 */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            最近学习动态
          </h2>
          {recentProgress.length === 0 ? (
            <p className="text-sm text-gray-500">暂无学习记录</p>
          ) : (
            <div className="space-y-3">
              {recentProgress.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-700">
                      {p.user.name || p.user.email.split("@")[0]}
                    </span>
                    <span className="mx-1.5 text-gray-400">·</span>
                    <span className="text-gray-500">{p.lesson.title}</span>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {p.completed ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        已完成
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {stepLabels[p.step - 1] || `步骤${p.step}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 最近注册 */}
      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          最近注册用户
        </h2>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-gray-500">暂无用户</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                  {(u.name || u.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {u.name || "未命名"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {u.createdAt.toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
