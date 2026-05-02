"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  Mic,
  MessageSquare,
  Share2,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { useState } from "react";

interface Props {
  lessonId: string;
  lessonTitle: string;
  wordsLearned: number;
  totalSentences: number;
  savedSentences: number;
  recordingsMade: number;
  expressionDone: boolean;
}

export function SummaryStepClient({
  lessonId,
  lessonTitle,
  wordsLearned,
  totalSentences,
  savedSentences,
  recordingsMade,
  expressionDone,
}: Props) {
  const { updateProgress } = useProgress(lessonId);
  const [completed, setCompleted] = useState(false);

  function handleComplete() {
    if (completed) return;
    setCompleted(true);
    updateProgress({ step: 5, summaryGenerated: true, completed: true });
  }

  const stats = [
    {
      icon: BookOpen,
      label: "学习词汇",
      value: `${wordsLearned} 个`,
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: BookOpen,
      label: "课程句子",
      value: `${totalSentences} 句`,
      color: "text-orange-600 bg-orange-50",
    },
    {
      icon: Mic,
      label: "录音次数",
      value: `${recordingsMade} 次`,
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: MessageSquare,
      label: "表达练习",
      value: expressionDone ? "已完成" : "未完成",
      done: expressionDone,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">课程完成！</h2>
          <p className="text-sm text-gray-500">
            你已完成「{lessonTitle || "本课"}」的学习
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Share Card */}
        <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold">SpeakPro</span>
          </div>
          <p className="mb-1 text-lg font-bold">今日学习完成</p>
          <p className="text-sm text-blue-100">
            学习了 {wordsLearned} 个词汇，收藏 {savedSentences} 个句子
            {recordingsMade > 0 && `，录音 ${recordingsMade} 次`}
          </p>
          <div className="mt-4 flex gap-4 text-xs text-blue-200">
            <span className="flex items-center gap-1">
              {expressionDone ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              自由表达
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleComplete}
            disabled={completed}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              completed
                ? "bg-green-100 text-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {completed ? (
              <>
                <Check className="h-4 w-4" />
                已完成本课
              </>
            ) : (
              <>
                <Award className="h-4 w-4" />
                标记本课完成
              </>
            )}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Share2 className="h-4 w-4" />
            分享成绩
          </button>
        </div>
      </div>

      {/* Next */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lessonId}/expression`}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          上一步
        </Link>
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          继续学习下一课
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
