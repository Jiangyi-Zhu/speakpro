import Link from "next/link";
import {
  User,
  BookOpen,
  Mic,
  MessageSquare,
  Bookmark,
  Flame,
  Clock,
  Award,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  let user = { name: "未登录", email: "", streak: 0, totalMinutes: 0, lessonsCompleted: 0 };
  let vocabCount = 0;
  let recordingCount = 0;
  let expressionCount = 0;
  let savedCount = 0;

  if (session?.user?.id) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (dbUser) {
        user = {
          name: dbUser.name || "用户",
          email: dbUser.email,
          streak: dbUser.streakDays,
          totalMinutes: dbUser.totalMinutes,
          lessonsCompleted: 0,
        };
      }

      user.lessonsCompleted = await prisma.userProgress.count({
        where: { userId: session.user.id, completed: true },
      });
      vocabCount = await prisma.vocabularyItem.count({
        where: { userId: session.user.id },
      });
      recordingCount = await prisma.recording.count({
        where: { userId: session.user.id },
      });
      expressionCount = await prisma.expression.count({
        where: { userId: session.user.id },
      });
      savedCount = await prisma.savedSentence.count({
        where: { userId: session.user.id },
      });
    } catch {
      // DB error
    }
  }

  const menuItems = [
    { href: "/vocabulary-book", icon: BookOpen, label: "生词本", count: vocabCount },
    { href: "/recordings", icon: Mic, label: "我的录音", count: recordingCount },
    { href: "/expressions", icon: MessageSquare, label: "表达积累", count: expressionCount },
    { href: "/saved-sentences", icon: Bookmark, label: "收藏句子", count: savedCount },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Profile Header */}
      <div className="mb-8 rounded-2xl bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
              <User className="h-8 w-8 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email || "未设置邮箱"}</p>
            </div>
          </div>
          {session?.user && (
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              登出
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
          {[
            { icon: Flame, label: "连续打卡", value: `${user.streak} 天` },
            { icon: Clock, label: "学习时长", value: `${user.totalMinutes} 分` },
            { icon: Award, label: "完成课程", value: `${user.lessonsCompleted} 课` },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-1 h-5 w-5 text-gray-400" />
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="rounded-2xl bg-white shadow-sm">
        {menuItems.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50 ${
              i < menuItems.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{item.count}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>

      {/* Not logged in prompt */}
      {!session?.user && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
          <p className="mb-3 text-sm text-brand-800">登录后可保存学习进度和生词</p>
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            登录
          </Link>
        </div>
      )}
    </div>
  );
}
