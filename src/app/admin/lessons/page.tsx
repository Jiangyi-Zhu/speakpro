import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { LessonActions } from "./actions";

const difficultyLabel: Record<string, string> = {
  BEGINNER: "入门",
  INTERMEDIATE: "中级",
  ADVANCED: "高级",
};

export default async function AdminLessonsPage() {
  let lessons: Array<{
    id: string;
    title: string;
    difficulty: string;
    published: boolean;
    _count: { segments: number; progress: number; questions: number };
    completedCount: number;
  }> = [];

  try {
    const raw = await prisma.lesson.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        difficulty: true,
        published: true,
        _count: { select: { segments: true, progress: true, questions: true } },
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

    lessons = raw.map((l) => ({
      ...l,
      completedCount: completedMap.get(l.id) || 0,
    }));
  } catch {
    // DB not connected
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">课程管理</h1>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          新建课程
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            还没有课程，点击「新建课程」开始
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">
                  课程名称
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">难度</th>
                <th className="px-4 py-3 font-medium text-gray-500">段落</th>
                <th className="px-4 py-3 font-medium text-gray-500">问题</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  完成率
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lessons.map((lesson) => {
                const rate =
                  lesson._count.progress > 0
                    ? Math.round(
                        (lesson.completedCount / lesson._count.progress) * 100
                      )
                    : 0;
                return (
                  <tr key={lesson.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {lesson.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {difficultyLabel[lesson.difficulty] || lesson.difficulty}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {lesson._count.segments}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {lesson._count.questions}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {lesson._count.progress > 0 ? (
                        <span>
                          {lesson.completedCount}/{lesson._count.progress}
                          <span className="ml-1 text-xs text-gray-400">
                            ({rate}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lesson.published ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Eye className="h-3.5 w-3.5" />
                          已发布
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <EyeOff className="h-3.5 w-3.5" />
                          草稿
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/lessons/${lesson.id}/edit`}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                          title="编辑"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600"
                          title="预览"
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <LessonActions
                          lessonId={lesson.id}
                          published={lesson.published}
                          title={lesson.title}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
