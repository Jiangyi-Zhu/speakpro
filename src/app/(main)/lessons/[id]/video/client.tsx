"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Play, Eye, EyeOff } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

interface Segment {
  id: string;
  index: number;
  textEn: string;
  textZh: string;
  startTime: number | null;
  endTime: number | null;
}

interface Props {
  lessonId: string;
  videoUrl: string | null;
  segments: Segment[];
}

export function VideoStepClient({ lessonId, videoUrl, segments }: Props) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showChinese, setShowChinese] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<any>(null);
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);

  const activeSegment = segments.find(
    (s) =>
      s.startTime !== null &&
      s.endTime !== null &&
      currentTime >= s.startTime &&
      currentTime <= s.endTime
  );

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-900">
        {videoUrl ? (
          <ReactPlayer
            ref={(p: any) => { playerRef.current = p; }}
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            onProgress={(state: any) =>
              setCurrentTime(state.playedSeconds)
            }
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-white">
            <Play className="mb-3 h-16 w-16 text-white/50" />
            <p className="text-sm text-white/60">视频播放区域</p>
            <p className="mt-1 text-xs text-white/40">
              管理后台上传视频后将在此播放
            </p>
          </div>
        )}

        {/* Live subtitle overlay */}
        {activeSegment && (
          <div className="absolute bottom-4 left-4 right-4 text-center">
            {showEnglish && (
              <p className="mb-1 rounded bg-black/70 px-3 py-1 text-sm text-white">
                {activeSegment.textEn}
              </p>
            )}
            {showChinese && activeSegment.textZh && (
              <p className="rounded bg-black/50 px-3 py-1 text-xs text-gray-200">
                {activeSegment.textZh}
              </p>
            )}
          </div>
        )}
      </div>

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
          英文字幕
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
          中文翻译
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
          <div className="space-y-4">
            {segments.map((seg) => {
              const isActive = activeSegment?.id === seg.id;
              return (
                <div
                  key={seg.id}
                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                    isActive ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    if (seg.startTime !== null && playerRef.current) {
                      (playerRef.current as any).seekTo(seg.startTime, "seconds");
                    }
                  }}
                >
                  {showEnglish && (
                    <p
                      className={`text-sm ${isActive ? "font-medium text-blue-900" : "text-gray-800"}`}
                    >
                      {seg.textEn}
                    </p>
                  )}
                  {showChinese && seg.textZh && (
                    <p className="mt-1 text-sm text-gray-500">{seg.textZh}</p>
                  )}
                </div>
              );
            })}
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
