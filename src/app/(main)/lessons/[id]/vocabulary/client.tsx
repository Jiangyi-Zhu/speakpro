"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Check, X, Loader2, ArrowRight } from "lucide-react";
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
  const [savedWords, setSavedWords] = useState<Map<string, SavedWord>>(
    new Map()
  );
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
                u.set(cleaned, {
                  word: cleaned,
                  status: res.ok ? "saved" : "error",
                });
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

  function markComplete() {
    if (!markedRef.current) {
      markedRef.current = true;
      updateProgress({ step: 2, vocabCompleted: true });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            阅读文章，点击标记生词
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            标记完成后进入下一步学习生词
          </p>
        </div>

        <div className="text-sm leading-loose text-gray-800">
          {segments.map((seg) => (
            <span key={seg.id}>
              {seg.textEn.split(/(\s+)/).map((token, i) => {
                const cleaned = token
                  .replace(/[^a-zA-Z'-]/g, "")
                  .toLowerCase();
                const isMarked = savedWords.has(cleaned);
                if (!token.trim()) return token;
                return (
                  <span
                    key={i}
                    onClick={() => handleWordClick(token)}
                    className={`cursor-pointer rounded px-0.5 transition-colors ${
                      isMarked
                        ? "bg-yellow-200 text-yellow-900"
                        : "hover:bg-brand-100"
                    }`}
                  >
                    {token}
                  </span>
                );
              })}{" "}
            </span>
          ))}
        </div>

        {wordList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {wordList.map((w) => (
              <span
                key={w.word}
                className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800"
              >
                {w.status === "saving" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {w.status === "saved" && (
                  <Check className="h-3 w-3 text-green-600" />
                )}
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
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lessonId}/video`}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
        >
          上一步
        </Link>
        {wordList.length > 0 ? (
          <Link
            href={`/lessons/${lessonId}/word-study`}
            onClick={markComplete}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            学习生词 ({wordList.length})
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href={`/lessons/${lessonId}/sentences`}
            onClick={markComplete}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            没有生词，下一步
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
