"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Search, Mic, Type, Play, Pause } from "lucide-react";

interface Expression {
  id: string;
  type: string;
  content: string;
  audioUrl: string;
  question: string;
  lessonId: string;
  lessonTitle: string;
  createdAt: string;
}

interface Props {
  expressions: Expression[];
}

export function ExpressionsClient({ expressions }: Props) {
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = expressions.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.content.toLowerCase().includes(q) ||
      e.question.toLowerCase().includes(q) ||
      e.lessonTitle.includes(q)
    );
  });

  function togglePlay(id: string) {
    if (playingId === id) {
      const audio = document.getElementById(`expr-audio-${id}`) as HTMLAudioElement;
      audio?.pause();
      setPlayingId(null);
    } else {
      if (playingId) {
        const prev = document.getElementById(`expr-audio-${playingId}`) as HTMLAudioElement;
        prev?.pause();
      }
      const audio = document.getElementById(`expr-audio-${id}`) as HTMLAudioElement;
      if (audio) {
        audio.play();
        audio.onended = () => setPlayingId(null);
        setPlayingId(id);
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">表达积累</h1>
        <p className="mt-1 text-sm text-gray-500">
          {expressions.length} 个自由表达记录
        </p>
      </div>

      {expressions.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            {expressions.length === 0
              ? "还没有表达记录，在课程的自由表达环节写下你的想法吧"
              : "没有匹配的记录"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((expr) => (
            <div
              key={expr.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                {expr.type === "AUDIO" ? (
                  <Mic className="h-3.5 w-3.5" />
                ) : (
                  <Type className="h-3.5 w-3.5" />
                )}
                <span className="font-medium">{expr.question}</span>
              </div>

              {expr.type === "TEXT" ? (
                <p className="text-base leading-relaxed text-gray-900">
                  {expr.content}
                </p>
              ) : expr.audioUrl ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePlay(expr.id)}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                      playingId === expr.id
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {playingId === expr.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </button>
                  <audio
                    id={`expr-audio-${expr.id}`}
                    src={expr.audioUrl}
                    preload="none"
                  />
                  <span className="text-sm text-gray-400">语音回答</span>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">语音已录制</p>
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <Link
                  href={`/lessons/${expr.lessonId}/expression`}
                  className="hover:text-blue-600"
                >
                  {expr.lessonTitle}
                </Link>
                <span>
                  {new Date(expr.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
