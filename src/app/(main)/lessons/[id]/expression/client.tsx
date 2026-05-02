"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Mic,
  Square,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Eye,
  ArrowRight,
  RotateCcw,
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
  initialSubmissions?: Record<string, string>;
}

export function ExpressionStepClient({
  lessonId,
  questions,
  initialSubmissions = {},
}: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [showAnswer, setShowAnswer] = useState<Set<number>>(new Set());
  const [questionAudioUrls, setQuestionAudioUrls] = useState<Map<number, string>>(
    () => {
      const map = new Map<number, string>();
      questions.forEach((q, idx) => {
        if (initialSubmissions[q.id]) {
          map.set(idx, initialSubmissions[q.id]);
        }
      });
      return map;
    }
  );
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(() => {
    const set = new Set<number>();
    questions.forEach((q, idx) => {
      if (initialSubmissions[q.id]) set.add(idx);
    });
    return set;
  });
  const [savingQuestion, setSavingQuestion] = useState(false);

  const recorder = useAudioRecorder();
  const { updateProgress } = useProgress(lessonId);
  const question = questions[currentQ];
  const recorderQRef = useRef<number>(-1);

  const currentAudioUrl = questionAudioUrls.get(currentQ);

  const saveExpression = useCallback(
    async (blob: Blob, qId: string, idx: number) => {
      setSavingQuestion(true);
      try {
        const buffer = await blob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
        );
        const audioUrl = `data:audio/webm;base64,${base64}`;

        const res = await fetch("/api/expressions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            questionId: qId,
            type: "AUDIO",
            audioUrl,
          }),
        });

        if (res.ok) {
          setSavedQuestions((prev) => {
            const next = new Set([...prev, idx]);
            if (next.size >= questions.length) {
              updateProgress({ step: 5, expressionDone: true });
            }
            return next;
          });
        }
      } catch {
        // ignore
      }
      setSavingQuestion(false);
    },
    [lessonId, questions.length, updateProgress]
  );

  useEffect(() => {
    if (recorder.audioBlob && !recorder.isRecording) {
      const idx = recorderQRef.current;
      if (idx >= 0 && idx < questions.length) {
        const url = URL.createObjectURL(recorder.audioBlob);
        setQuestionAudioUrls((prev) => new Map(prev).set(idx, url));
        if (!savedQuestions.has(idx)) {
          saveExpression(recorder.audioBlob, questions[idx].id, idx);
        }
      }
    }
  }, [recorder.audioBlob, recorder.isRecording, questions, saveExpression, savedQuestions]);

  function startRecording() {
    recorderQRef.current = currentQ;
    recorder.startRecording();
  }

  function handleReRecord() {
    setQuestionAudioUrls((prev) => {
      const next = new Map(prev);
      next.delete(currentQ);
      return next;
    });
    setSavedQuestions((prev) => {
      const next = new Set(prev);
      next.delete(currentQ);
      return next;
    });
    recorder.resetRecording();
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

  const isRecordingThisQ = recorder.isRecording && recorderQRef.current === currentQ;

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
            {savedQuestions.has(currentQ) && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                <Check className="h-3 w-3" />
                已保存
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
              isRecordingThisQ ? recorder.stopRecording : startRecording
            }
            className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
              isRecordingThisQ
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                : "bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
            }`}
          >
            {isRecordingThisQ ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>

          {isRecordingThisQ && (
            <p className="text-sm font-medium text-red-500">
              录音中... {recorder.duration}s
            </p>
          )}

          {!isRecordingThisQ && !currentAudioUrl && (
            <p className="text-sm text-gray-400">点击麦克风用英语回答问题</p>
          )}

          {/* Show saved/recorded audio */}
          {currentAudioUrl && !recorder.isRecording && (
            <div className="flex w-full flex-col items-center gap-3">
              <audio
                src={currentAudioUrl}
                controls
                className="w-full max-w-sm"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReRecord}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  重录
                </button>
                {savingQuestion && recorderQRef.current === currentQ && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {savedQuestions.has(currentQ) && !savingQuestion && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
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
          onClick={() => updateProgress({ step: 5, expressionDone: savedQuestions.size > 0 })}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
        >
          下一步：学习总结
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
