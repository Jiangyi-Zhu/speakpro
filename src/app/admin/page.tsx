import { GraduationCap, Users, BookOpen, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  let lessonCount = 0;
  let userCount = 0;
  let progressCount = 0;
  let vocabCount = 0;

  try {
    lessonCount = await prisma.lesson.count();
    userCount = await prisma.user.count();
    progressCount = await prisma.userProgress.count();
    vocabCount = await prisma.vocabularyItem.count();
  } catch {
    // DB error
  }

  const stats = [
    { icon: GraduationCap, label: "课程总数", value: lessonCount.toString() },
    { icon: Users, label: "注册用户", value: userCount.toString() },
    { icon: BookOpen, label: "学习人次", value: progressCount.toString() },
    { icon: TrendingUp, label: "收藏词汇", value: vocabCount.toString() },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">管理概览</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 p-5">
            <stat.icon className="mb-3 h-5 w-5 text-gray-400" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
