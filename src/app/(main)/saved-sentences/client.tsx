"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkCheck, Search, Trash2, Loader2, BookOpen, MessageSquare } from "lucide-react";

interface Sentence {
  id: string;
  segmentId: string;
  textEn: string;
  textZh: string;
  grammarNote: string;
  note: string;
  lessonId: string;
  lessonTitle: string;
  createdAt: string;
}

interface Props {
  initialSentences: Sentence[];
}

export function SavedSentencesClient({ initialSentences }: Props) {
  const [sentences, setSentences] = useState(initialSentences);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sentences.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.textEn.toLowerCase().includes(q) ||
      s.textZh.includes(q) ||
      s.lessonTitle.includes(q)
    );
  });

  async function removeSentence(segmentId: string, id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/saved-sentences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId }),
      });
      setSentences((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
    setDeletingId(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">收藏句子</h1>
        <p className="mt-1 text-sm text-gray-500">
          {sentences.length} 个收藏句子
        </p>
      </div>

      {sentences.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索句子..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <BookmarkCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            {sentences.length === 0
              ? "还没有收藏句子，在跟读练习中点击书签图标收藏吧"
              : "没有匹配的句子"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sentence) => (
            <div
              key={sentence.id}
              className="rounded-2xl border border-gray-200/60 bg-white shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === sentence.id ? null : sentence.id)
                  }
                >
                  <p className="text-base font-medium leading-relaxed text-gray-900">
                    {sentence.textEn}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{sentence.textZh}</p>

                  {expandedId === sentence.id && sentence.grammarNote && (
                    <div className="mt-3 rounded-lg bg-brand-50 p-3 text-sm leading-relaxed text-brand-800">
                      <div className="mb-1 flex items-center gap-1 font-medium">
                        <BookOpen className="h-3.5 w-3.5" />
                        语法解析
                      </div>
                      {sentence.grammarNote}
                    </div>
                  )}

                  {expandedId === sentence.id && sentence.note && (
                    <div className="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                      <div className="mb-1 flex items-center gap-1 font-medium">
                        <MessageSquare className="h-3.5 w-3.5" />
                        笔记
                      </div>
                      {sentence.note}
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <Link
                      href={`/lessons/${sentence.lessonId}/sentences`}
                      className="hover:text-brand-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      来自：{sentence.lessonTitle}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => removeSentence(sentence.segmentId, sentence.id)}
                  disabled={deletingId === sentence.id}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="取消收藏"
                >
                  {deletingId === sentence.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
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
