"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

interface Segment {
  id: string;
  index: number;
  textEn: string;
  textZh: string;
}

interface Props {
  lessonId: string;
  videoUrl: string | null;
  segments: Segment[];
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
    } else if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
  } catch {}
  return null;
}

export function VideoStepClient({ lessonId, videoUrl, segments }: Props) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showChinese, setShowChinese] = useState(true);
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {embedUrl && (
        <div className="aspect-video overflow-hidden rounded-xl bg-gray-900">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Subtitle Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowEnglish(!showEnglish)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            showEnglish
              ? "bg-blue-50 text-blue-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {showEnglish ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          英文
        </button>
        <button
          onClick={() => setShowChinese(!showChinese)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            showChinese
              ? "bg-blue-50 text-blue-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {showChinese ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          中文
        </button>
      </div>

      {/* Transcript */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          文本对照
        </h2>
        {segments.length === 0 ? (
          <p className="text-sm text-gray-500">暂无文本内容</p>
        ) : (
          <div className="space-y-3">
            {segments.map((seg) => (
              <div
                key={seg.id}
                className="rounded-lg p-3 hover:bg-gray-50"
              >
                {showEnglish && (
                  <p className="text-sm leading-relaxed text-gray-800">
                    {seg.textEn}
                  </p>
                )}
                {showChinese && seg.textZh && (
                  <p className="mt-1 text-sm text-gray-500">{seg.textZh}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Step */}
      <div className="flex justify-end">
        <Link
          href={`/lessons/${lessonId}/vocabulary`}
          onClick={() => {
            if (!markedRef.current) {
              markedRef.current = true;
              updateProgress({ step: 1, videoWatched: true });
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          下一步：词汇预习
        </Link>
      </div>
    </div>
  );
}
