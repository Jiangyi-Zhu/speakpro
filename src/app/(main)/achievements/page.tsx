import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { Award, Lock } from "lucide-react";

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await checkAndAwardAchievements(session.user.id);

  const allAchievements = await prisma.achievement.findMany({
    orderBy: { name: "asc" },
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    select: { achievementId: true, unlockedAt: true },
  });

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  const achievements = allAchievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) || null,
  }));

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">成就</h1>
        <p className="mt-1 text-sm text-gray-500">
          已解锁 {unlockedCount} / {achievements.length} 个成就
        </p>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-yellow-500 transition-all"
          style={{
            width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%`,
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-5 transition-colors ${
              a.unlocked
                ? "border-yellow-200 bg-yellow-50"
                : "border-gray-200 bg-white opacity-60"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-3xl">{a.icon}</span>
              {a.unlocked ? (
                <Award className="h-5 w-5 text-yellow-500" />
              ) : (
                <Lock className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <h3
              className={`font-semibold ${a.unlocked ? "text-gray-900" : "text-gray-500"}`}
            >
              {a.description}
            </h3>
            {a.unlocked && a.unlockedAt && (
              <p className="mt-1 text-xs text-gray-400">
                {a.unlockedAt.toLocaleDateString("zh-CN")} 解锁
              </p>
            )}
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Award className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">暂无成就数据</p>
        </div>
      )}
    </div>
  );
}
