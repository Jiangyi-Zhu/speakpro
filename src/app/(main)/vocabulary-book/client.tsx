"use client";

import { useState } from "react";
import { BookOpen, Search, Check, Circle, Loader2 } from "lucide-react";

interface Word {
  id: string;
  word: string;
  phonetic: string | null;
  definition: string | null;
  example: string | null;
  mastered: boolean;
  lessonTitle: string | null;
}

interface Props {
  initialWords: Word[];
}

export function VocabularyBookClient({ initialWords }: Props) {
  const [words, setWords] = useState(initialWords);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "mastered" | "learning">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = words.filter((w) => {
    if (search && !w.word.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "mastered") return w.mastered;
    if (filter === "learning") return !w.mastered;
    return true;
  });

  async function toggleMastered(id: string) {
    const word = words.find((w) => w.id === id);
    if (!word) return;

    setTogglingId(id);
    try {
      await fetch("/api/vocabulary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, mastered: !word.mastered }),
      });
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, mastered: !w.mastered } : w))
      );
    } catch {
      // ignore
    }
    setTogglingId(null);
  }

  const masteredCount = words.filter((w) => w.mastered).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">生词本</h1>
        <p className="mt-1 text-sm text-gray-500">
          {words.length} 个单词，{masteredCount} 个已掌握
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索单词..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "learning", "mastered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-brand-50 text-brand-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "全部" : f === "mastered" ? "已掌握" : "学习中"}
            </button>
          ))}
        </div>
      </div>

      {/* Word List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            {words.length === 0
              ? "还没有收藏生词，在课程中标记不认识的单词吧"
              : "没有匹配的单词"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((word) => (
            <div
              key={word.id}
              className="rounded-2xl bg-white shadow-sm p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">
                      {word.word}
                    </span>
                    {word.phonetic && (
                      <span className="text-sm text-gray-400">{word.phonetic}</span>
                    )}
                  </div>
                  {word.definition && (
                    <p className="mb-1 text-sm text-gray-600">{word.definition}</p>
                  )}
                  {word.example && (
                    <p className="text-sm italic text-gray-400">{word.example}</p>
                  )}
                  {word.lessonTitle && (
                    <p className="mt-2 text-xs text-gray-400">
                      来自：{word.lessonTitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleMastered(word.id)}
                  disabled={togglingId === word.id}
                  className={`rounded-lg p-2 transition-colors ${
                    word.mastered
                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                      : "bg-gray-100 text-gray-400 hover:bg-brand-100 hover:text-brand-600"
                  }`}
                  title={word.mastered ? "标记为未掌握" : "标记为已掌握"}
                >
                  {togglingId === word.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : word.mastered ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
