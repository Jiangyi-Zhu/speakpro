import { prisma } from "@/lib/db";
import { User, Shield, BookOpen, Clock } from "lucide-react";

export default async function AdminUsersPage() {
  let users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    streakDays: number;
    totalMinutes: number;
    createdAt: Date;
    _count: { progress: number; vocabularyItems: number };
  }> = [];

  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        streakDays: true,
        totalMinutes: true,
        createdAt: true,
        _count: { select: { progress: true, vocabularyItems: true } },
      },
    });
  } catch {
    // DB error
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="mt-1 text-sm text-gray-500">{users.length} 个注册用户</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <User className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">暂无用户</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">用户</th>
                <th className="px-4 py-3 font-medium text-gray-500">角色</th>
                <th className="px-4 py-3 font-medium text-gray-500">学习课程</th>
                <th className="px-4 py-3 font-medium text-gray-500">词汇</th>
                <th className="px-4 py-3 font-medium text-gray-500">连续打卡</th>
                <th className="px-4 py-3 font-medium text-gray-500">注册时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{u.name || "未命名"}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-gray-500">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {u._count.progress}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u._count.vocabularyItems}</td>
                  <td className="px-4 py-3 text-gray-500">{u.streakDays} 天</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {u.createdAt.toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
