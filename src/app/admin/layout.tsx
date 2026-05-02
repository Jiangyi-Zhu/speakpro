import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, LayoutDashboard, GraduationCap, Users, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";

const adminNav = [
  { href: "/admin", icon: LayoutDashboard, label: "概览" },
  { href: "/admin/lessons", icon: GraduationCap, label: "课程管理" },
  { href: "/admin/users", icon: Users, label: "用户管理" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-gray-50">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-gray-900">SpeakPro</span>
          <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
            Admin
          </span>
        </div>
        <nav className="flex-1 p-3">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-white hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回前台
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
