import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SpeakPro - 职场英语口语训练",
    template: "%s | SpeakPro",
  },
  description: "通过精选职场英语视频，五步学习法系统提升你的职场英语口语表达能力",
  keywords: ["职场英语", "英语口语", "口语训练", "商务英语", "英语学习"],
  openGraph: {
    title: "SpeakPro - 职场英语口语训练",
    description: "科学的五步学习法，从视频观看到口语表达，帮你系统提升职场英语交流能力",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
