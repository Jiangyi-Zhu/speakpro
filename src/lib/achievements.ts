import { prisma } from "@/lib/db";

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  const achievements = await prisma.achievement.findMany();
  const existing = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const existingIds = new Set(existing.map((e) => e.achievementId));

  const [
    lessonsCompleted,
    wordsCollected,
    recordingsMade,
    user,
    fullyCompleted,
  ] = await Promise.all([
    prisma.userProgress.count({ where: { userId, completed: true } }),
    prisma.vocabularyItem.count({ where: { userId } }),
    prisma.recording.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { streakDays: true } }),
    prisma.userProgress.count({
      where: {
        userId,
        videoWatched: true,
        vocabCompleted: true,
        sentencesCompleted: true,
        expressionDone: true,
        summaryGenerated: true,
      },
    }),
  ]);

  const stats = {
    lessonsCompleted,
    wordsCollected,
    recordingsMade,
    streakDays: user?.streakDays ?? 0,
    allStepsCompleted: fullyCompleted > 0,
  };

  const newlyAwarded: string[] = [];

  for (const achievement of achievements) {
    if (existingIds.has(achievement.id)) continue;

    const condition = JSON.parse(achievement.condition);
    let met = true;

    for (const [key, value] of Object.entries(condition)) {
      const stat = stats[key as keyof typeof stats];
      if (typeof value === "boolean") {
        if (stat !== value) met = false;
      } else if (typeof value === "number") {
        if (typeof stat === "number" && stat < value) met = false;
      }
    }

    if (met) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newlyAwarded.push(achievement.name);
    }
  }

  return newlyAwarded;
}
