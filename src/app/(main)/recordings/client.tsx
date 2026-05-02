"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, Search, Play, Pause } from "lucide-react";

interface Recording {
  id: string;
  audioUrl: string;
  duration: number;
  textEn: string;
  textZh: string;
  lessonId: string;
  lessonTitle: string;
  createdAt: string;
}

interface Props {
  recordings: Recording[];
}

export function RecordingsClient({ recordings }: Props) {
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = recordings.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.textEn.toLowerCase().includes(q) ||
      r.textZh.includes(q) ||
      r.lessonTitle.includes(q)
    );
  });

  function togglePlay(id: string, audioUrl: string) {
    if (playingId === id) {
      const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
      audio?.pause();
      setPlayingId(null);
    } else {
      if (playingId) {
        const prev = document.getElementById(`audio-${playingId}`) as HTMLAudioElement;
        prev?.pause();
      }
      const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
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
        <h1 className="text-2xl font-bold text-gray-900">我的录音</h1>
        <p className="mt-1 text-sm text-gray-500">
          {recordings.length} 个跟读录音
        </p>
      </div>

      {recordings.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索句子..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Mic className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            {recordings.length === 0
              ? "还没有录音，在跟读练习中录制你的发音吧"
              : "没有匹配的录音"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => togglePlay(rec.id, rec.audioUrl)}
                  className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    playingId === rec.id
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {playingId === rec.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>
                <audio id={`audio-${rec.id}`} src={rec.audioUrl} preload="none" />
                <div className="flex-1">
                  <p className="text-base font-medium leading-relaxed text-gray-900">
                    {rec.textEn}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{rec.textZh}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>{rec.duration}s</span>
                    <Link
                      href={`/lessons/${rec.lessonId}/sentences`}
                      className="hover:text-blue-600"
                    >
                      {rec.lessonTitle}
                    </Link>
                    <span>
                      {new Date(rec.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
