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
        className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
      >
        重试
      </button>
    </div>
  );
}
