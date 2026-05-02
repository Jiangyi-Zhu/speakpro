"use client";

import { BookOpen } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <BookOpen className="mb-4 h-12 w-12 text-gray-300" />
      <h1 className="mb-2 text-xl font-bold text-gray-900">出错了</h1>
      <p className="mb-6 text-sm text-gray-500">页面加载时发生错误</p>
      <button
        onClick={reset}
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        重试
      </button>
    </div>
  );
}
