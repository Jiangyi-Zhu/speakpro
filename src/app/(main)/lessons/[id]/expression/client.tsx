"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Mic,
  Square,
  Send,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useProgress } from "@/hooks/use-progress";

interface Question {
  id: string;
  question: string;
  hint: string;
  sampleAnswer: string;
}

interface Props {
  lessonId: string;
  questions: Question[];
}

export function ExpressionStepClient({ lessonId, questions }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [showAnswer, setShowAnswer] = useState<Set<number>>(new Set());

  const recorder = useAudioRecorder();
  const { updateProgress } = useProgress(lessonId);
  const question = questions[currentQ];

  async function handleSubmit() {
    setSubmitting(true);
    try {
      let audioUrl: string | undefined;

      if (recorder.audioBlob) {
        const buffer = await recorder.audioBlob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
        );
        audioUrl = `data:audio/webm;base64,${base64}`;
      }

      await fetch("/api/expressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          questionId: question?.id,
          type: "AUDIO",
          audioUrl,
        }),
      });

      setSubmitted((prev) => {
        const next = new Set([...prev, currentQ]);
        if (next.size >= questions.length) {
          updateProgress({ step: 5, expressionDone: true });
        }
        return next;
      });
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">暂无表达练习题目</p>
        </div>
        <div className="flex items-center justify-between">
          <Link
            href={`/lessons/${lessonId}/sentences`}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
          >
            上一步
          </Link>
          <Link
            href={`/lessons/${lessonId}/summary`}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            下一步：学习总结
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm p-6">
        {/* Question */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Question {currentQ + 1} / {questions.length}
            </span>
            {submitted.has(currentQ) && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                <Check className="h-3 w-3" />
                已提交
              </span>
            )}
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            {question.question}
          </h2>
          {question.hint && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {question.hint}
            </p>
          )}
        </div>

        {/* Audio Recording */}
        <div className="flex flex-col items-center gap-4 py-6">
          <button
            onClick={
              recorder.isRecording ? recorder.stopRecording : recorder.startRecording
            }
            disabled={submitted.has(currentQ)}
            className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
              recorder.isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                : submitted.has(currentQ)
                  ? "bg-gray-300 text-white"
                  : "bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
            }`}
          >
            {recorder.isRecording ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>

          {recorder.isRecording && (
            <p className="text-sm font-medium text-red-500">
              录音中... {recorder.duration}s
            </p>
          )}

          {recorder.audioUrl && !recorder.isRecording && (
            <div className="flex flex-col items-center gap-3">
              <audio src={recorder.audioUrl} controls />
              <div className="flex gap-3">
                {!submitted.has(currentQ) && (
                  <>
                    <button
                      onClick={recorder.resetRecording}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      重录
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      提交
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {!recorder.isRecording && !recorder.audioUrl && !submitted.has(currentQ) && (
            <p className="text-sm text-gray-400">点击麦克风用英语回答问题</p>
          )}

          {recorder.error && (
            <p className="text-sm text-red-500">{recorder.error}</p>
          )}
        </div>

        {/* Sample Answer (hidden by default) */}
        {question.sampleAnswer && (
          <div className="border-t border-gray-100 pt-4">
            {showAnswer.has(currentQ) ? (
              <div className="rounded-lg bg-brand-50 p-4">
                <p className="mb-1 text-xs font-medium text-brand-600">推荐回答</p>
                <p className="text-sm leading-relaxed text-brand-800">
                  {question.sampleAnswer}
                </p>
              </div>
            ) : (
              <button
                onClick={() =>
                  setShowAnswer((prev) => new Set([...prev, currentQ]))
                }
                className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600"
              >
                <Eye className="h-4 w-4" />
                查看推荐回答
              </button>
            )}
          </div>
        )}

        {/* Question Navigation */}
        {questions.length > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              disabled={currentQ === 0}
              onClick={() => {
                setCurrentQ(currentQ - 1);
                if (recorder.isRecording) recorder.stopRecording();
                recorder.resetRecording();
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              上一题
            </button>
            <button
              disabled={currentQ === questions.length - 1}
              onClick={() => {
                setCurrentQ(currentQ + 1);
                if (recorder.isRecording) recorder.stopRecording();
                recorder.resetRecording();
              }}
              className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 disabled:opacity-30"
            >
              下一题
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lessonId}/sentences`}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
        >
          上一步
        </Link>
        <Link
          href={`/lessons/${lessonId}/summary`}
          onClick={() => updateProgress({ step: 5, expressionDone: submitted.size > 0 })}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
        >
          下一步：学习总结
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
