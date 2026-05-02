"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { BookOpen, Plus, Check, X, Loader2 } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

interface Segment {
  id: string;
  textEn: string;
  textZh: string;
}

interface MarkedWord {
  word: string;
  saving: boolean;
  saved: boolean;
}

interface Props {
  lessonId: string;
  segments: Segment[];
}

export function VocabularyStepClient({ lessonId, segments }: Props) {
  const [markedWords, setMarkedWords] = useState<MarkedWord[]>([]);
  const [showTranslation, setShowTranslation] = useState(true);
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);

  const handleWordClick = useCallback(
    (word: string) => {
      const cleaned = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
      if (!cleaned || cleaned.length < 2) return;
      setMarkedWords((prev) => {
        if (prev.some((w) => w.word === cleaned)) return prev;
        return [...prev, { word: cleaned, saving: false, saved: false }];
      });
    },
    []
  );

  async function saveWord(index: number) {
    const w = markedWords[index];
    if (w.saved || w.saving) return;

    setMarkedWords((prev) => {
      const u = [...prev];
      u[index] = { ...u[index], saving: true };
      return u;
    });

    try {
      await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: w.word, lessonId }),
      });
      setMarkedWords((prev) => {
        const u = [...prev];
        u[index] = { ...u[index], saving: false, saved: true };
        return u;
      });
    } catch {
      setMarkedWords((prev) => {
        const u = [...prev];
        u[index] = { ...u[index], saving: false };
        return u;
      });
    }
  }

  function removeWord(index: number) {
    setMarkedWords((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      {/* Article */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">文章内容</h2>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              showTranslation ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {showTranslation ? "隐藏翻译" : "显示翻译"}
          </button>
        </div>

        <div className="space-y-4">
          {segments.map((seg) => (
            <div key={seg.id} className="rounded-lg p-3 hover:bg-gray-50">
              <p className="text-sm leading-relaxed text-gray-800">
                {seg.textEn.split(/(\s+)/).map((token, i) => {
                  const cleaned = token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
                  const isMarked = markedWords.some((w) => w.word === cleaned);
                  if (!token.trim()) return token;
                  return (
                    <span
                      key={i}
                      onClick={() => handleWordClick(token)}
                      className={`cursor-pointer rounded px-0.5 transition-colors ${
                        isMarked
                          ? "bg-yellow-200 text-yellow-900"
                          : "hover:bg-blue-100"
                      }`}
                    >
                      {token}
                    </span>
                  );
                })}
              </p>
              {showTranslation && seg.textZh && (
                <p className="mt-1 text-sm text-gray-500">{seg.textZh}</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          点击文中单词可标记为生词
        </p>
      </div>

      {/* Word List */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">标记的生词</h2>
          <span className="text-sm text-gray-400">{markedWords.length} 个</span>
        </div>

        {markedWords.length === 0 ? (
          <div className="py-8 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">在上方文章中点击不认识的单词</p>
          </div>
        ) : (
          <div className="space-y-2">
            {markedWords.map((w, i) => (
              <div
                key={w.word}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <span className="font-medium text-gray-900">{w.word}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveWord(i)}
                    disabled={w.saving || w.saved}
                    className={`rounded-lg p-1.5 transition-colors ${
                      w.saved
                        ? "bg-green-100 text-green-600"
                        : w.saving
                          ? "bg-gray-200 text-gray-400"
                          : "bg-gray-200 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                    }`}
                    title={w.saved ? "已收藏" : "收藏到生词本"}
                  >
                    {w.saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : w.saved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => removeWord(i)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lessonId}/video`}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          上一步
        </Link>
        <Link
          href={`/lessons/${lessonId}/sentences`}
          onClick={() => {
            if (!markedRef.current) {
              markedRef.current = true;
              updateProgress({ step: 2, vocabCompleted: true });
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          下一步：句子跟读
        </Link>
      </div>
    </div>
  );
}
