"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { BookOpen, Check, X, Loader2 } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

interface Segment {
  id: string;
  textEn: string;
  textZh: string;
}

interface SavedWord {
  word: string;
  status: "saving" | "saved" | "error";
}

interface Props {
  lessonId: string;
  segments: Segment[];
}

export function VocabularyStepClient({ lessonId, segments }: Props) {
  const [savedWords, setSavedWords] = useState<Map<string, SavedWord>>(new Map());
  const [showTranslation, setShowTranslation] = useState(true);
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);

  const handleWordClick = useCallback(
    (token: string) => {
      const cleaned = token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
      if (!cleaned || cleaned.length < 2) return;

      setSavedWords((prev) => {
        if (prev.has(cleaned)) {
          const next = new Map(prev);
          next.delete(cleaned);
          fetch("/api/vocabulary", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: cleaned }),
          }).catch(() => {});
          return next;
        }

        const next = new Map(prev);
        next.set(cleaned, { word: cleaned, status: "saving" });

        fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: cleaned, lessonId }),
        })
          .then((res) => {
            setSavedWords((p) => {
              const u = new Map(p);
              if (u.has(cleaned)) {
                u.set(cleaned, { word: cleaned, status: res.ok ? "saved" : "error" });
              }
              return u;
            });
          })
          .catch(() => {
            setSavedWords((p) => {
              const u = new Map(p);
              if (u.has(cleaned)) {
                u.set(cleaned, { word: cleaned, status: "error" });
              }
              return u;
            });
          });

        return next;
      });
    },
    [lessonId]
  );

  const wordList = Array.from(savedWords.values());

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
                  const isMarked = savedWords.has(cleaned);
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
          点击单词自动收录到生词本，再点取消
        </p>
      </div>

      {/* Word List */}
      {wordList.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">已收录生词</h2>
            <span className="text-sm text-gray-400">{wordList.length} 个</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {wordList.map((w) => (
              <span
                key={w.word}
                className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-800"
              >
                {w.status === "saving" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : w.status === "saved" ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : null}
                {w.word}
                <button
                  onClick={() => handleWordClick(w.word)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-yellow-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

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
