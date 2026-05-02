import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <BookOpen className="mb-4 h-12 w-12 text-gray-300" />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">404</h1>
      <p className="mb-6 text-sm text-gray-500">找不到你要访问的页面</p>
      <Link
        href="/"
        className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
      >
        返回首页
      </Link>
    </div>
  );
}
