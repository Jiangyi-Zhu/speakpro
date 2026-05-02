import Link from "next/link";
import { BookOpen, Play, Mic, MessageSquare, Award, ArrowRight, LogIn, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";

const steps = [
  {
    icon: Play,
    title: "视频学习",
    desc: "观看职场英语视频，开启沉浸式学习",
  },
  {
    icon: BookOpen,
    title: "词汇预习",
    desc: "标记生词，为深入学习做准备",
  },
  {
    icon: GraduationCap,
    title: "学习生词",
    desc: "查看释义和发音，结合语境掌握词汇",
  },
  {
    icon: Mic,
    title: "句子跟读",
    desc: "逐句跟读录音，纠正发音语调",
  },
  {
    icon: MessageSquare,
    title: "自由表达",
    desc: "围绕开放问题，练习口语表达",
  },
  {
    icon: Award,
    title: "学习总结",
    desc: "生成学习报告，记录你的成长轨迹",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Nav */}
      <header className="absolute left-0 right-0 top-0 z-10 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-bold">SpeakPro</span>
          </div>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20"
            >
              进入学习中心
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20"
            >
              <LogIn className="h-4 w-4" />
              登录
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-4 py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <BookOpen className="h-4 w-4" />
            职场英语口语训练平台
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            用真实视频
            <br />
            练出地道职场英语
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-brand-100 sm:text-xl">
            科学的六步学习法，从视频观看到口语表达，帮你系统提升职场英语交流能力
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
              >
                进入学习中心
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
                >
                  免费注册
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  已有账号，登录
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              六步学习法
            </h2>
            <p className="text-lg text-gray-500">
              科学的学习闭环，每一步都在为你的口语能力加分
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="group text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mb-1 text-xs font-semibold text-brand-600">
                  Step {i + 1}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            准备好提升你的职场英语了吗？
          </h2>
          <p className="mb-8 text-gray-500">
            每天 15 分钟，跟着视频练口语，积累地道表达
          </p>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-xl"
          >
            浏览课程
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">SpeakPro</span>
          </div>
          <p className="text-sm text-gray-400">职场英语口语训练平台</p>
        </div>
      </footer>
    </div>
  );
}
