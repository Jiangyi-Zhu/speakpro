import Link from "next/link";
import { BookOpen, Play, Mic, MessageSquare, Award, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Play,
    title: "视频学习",
    desc: "观看职场英语视频，开启沉浸式学习",
  },
  {
    icon: BookOpen,
    title: "词汇预习",
    desc: "标记生词，学习关键词汇的释义和用法",
  },
  {
    icon: Mic,
    title: "跟读练习",
    desc: "逐句跟读，录音对比，纠正发音",
  },
  {
    icon: MessageSquare,
    title: "自由表达",
    desc: "围绕开放问题，练习口语和写作表达",
  },
  {
    icon: Award,
    title: "学习总结",
    desc: "生成学习报告，记录你的成长轨迹",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-24 text-white sm:py-32">
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
          <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 sm:text-xl">
            科学的五步学习法，从视频观看到口语表达，帮你系统提升职场英语交流能力
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/lessons"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            >
              开始学习
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              免费注册
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              五步学习法
            </h2>
            <p className="text-lg text-gray-500">
              科学的学习闭环，每一步都在为你的口语能力加分
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <div key={i} className="group text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mb-1 text-xs font-semibold text-blue-600">
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
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
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
