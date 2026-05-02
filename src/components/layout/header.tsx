"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, User, Menu, X, Home, GraduationCap, Bookmark, Mic } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const desktopNav = [
  { href: "/dashboard", label: "首页" },
  { href: "/lessons", label: "课程" },
  { href: "/vocabulary-book", label: "生词本" },
  { href: "/saved-sentences", label: "收藏句子" },
  { href: "/recordings", label: "录音" },
  { href: "/profile", label: "我的" },
];

const mobileNav = [
  { href: "/dashboard", icon: Home, label: "首页" },
  { href: "/lessons", icon: GraduationCap, label: "课程" },
  { href: "/vocabulary-book", icon: BookOpen, label: "生词" },
  { href: "/recordings", icon: Mic, label: "录音" },
  { href: "/profile", icon: User, label: "我的" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLessonPage = pathname?.includes("/lessons/") && pathname !== "/lessons";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">SpeakPro</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname?.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-gray-600 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname?.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {!isLessonPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden">
          <div className="flex items-center justify-around">
            {mobileNav.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
