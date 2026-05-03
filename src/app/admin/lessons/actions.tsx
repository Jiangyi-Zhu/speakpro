"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";

export function LessonActions({
  lessonId,
  published,
  title,
}: {
  lessonId: string;
  published: boolean;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    setLoading(true);
    await fetch(`/api/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`确定删除「${title}」？此操作不可恢复。`)) return;
    setLoading(true);
    await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={togglePublish}
        disabled={loading}
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-orange-600 disabled:opacity-50"
        title={published ? "取消发布" : "发布"}
      >
        {published ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
        title="删除"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );
}
