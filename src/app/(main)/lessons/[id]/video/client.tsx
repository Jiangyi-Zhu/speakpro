"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Repeat,
  Repeat1,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

interface Segment {
  id: string;
  index: number;
  textEn: string;
  textZh: string;
  startTime: number | null;
  endTime: number | null;
}

type LoopMode = "none" | "all" | "single" | "times";

interface Props {
  lessonId: string;
  videoUrl: string | null;
  segments: Segment[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoStepClient({ lessonId, videoUrl, segments }: Props) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showChinese, setShowChinese] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>("none");
  const [loopCount, setLoopCount] = useState(3);
  const [currentLoopN, setCurrentLoopN] = useState(0);
  const [activeSegIndex, setActiveSegIndex] = useState(-1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);

  const timedSegments = segments.filter(
    (s) => s.startTime !== null && s.endTime !== null
  );

  const findActiveSegment = useCallback(
    (time: number) => {
      for (let i = 0; i < timedSegments.length; i++) {
        const s = timedSegments[i];
        if (time >= s.startTime! && time < s.endTime!) return i;
      }
      return -1;
    },
    [timedSegments]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      const idx = findActiveSegment(t);
      setActiveSegIndex(idx);

      if (loopMode === "single" && idx >= 0) {
        const seg = timedSegments[idx];
        if (t >= seg.endTime! - 0.05) {
          video.currentTime = seg.startTime!;
        }
      }

      if (loopMode === "times" && idx >= 0) {
        const seg = timedSegments[idx];
        if (t >= seg.endTime! - 0.05) {
          const next = currentLoopN + 1;
          if (next < loopCount) {
            setCurrentLoopN(next);
            video.currentTime = seg.startTime!;
          } else {
            setCurrentLoopN(0);
            setLoopMode("none");
          }
        }
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (loopMode === "all") {
        video.currentTime = 0;
        video.play();
      } else {
        setIsPlaying(false);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [findActiveSegment, loopMode, loopCount, currentLoopN, timedSegments]);

  useEffect(() => {
    if (activeSegIndex >= 0) {
      const el = transcriptRefs.current.get(activeSegIndex);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeSegIndex]);

  function seekTo(time: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (!isPlaying) videoRef.current.play();
    }
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  function cycleLoopMode() {
    setCurrentLoopN(0);
    if (loopMode === "none") setLoopMode("single");
    else if (loopMode === "single") setLoopMode("times");
    else if (loopMode === "times") setLoopMode("all");
    else setLoopMode("none");
  }

  const loopLabel: Record<LoopMode, string> = {
    none: "顺序播放",
    single: "单句循环",
    times: `循环 ${loopCount} 遍`,
    all: "全文循环",
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      {videoUrl && (
        <div className="overflow-hidden rounded-xl bg-gray-900">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full"
            playsInline
            preload="metadata"
          />

          {/* Subtitle overlay */}
          {activeSegIndex >= 0 && (
            <div className="bg-gray-900 px-4 py-3">
              {showEnglish && (
                <p className="text-sm leading-relaxed text-white">
                  {timedSegments[activeSegIndex].textEn}
                </p>
              )}
              {showChinese && timedSegments[activeSegIndex].textZh && (
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  {timedSegments[activeSegIndex].textZh}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {videoUrl && (
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPlaying ? "暂停" : "播放"}
          </button>
        )}

        <button
          onClick={cycleLoopMode}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            loopMode !== "none"
              ? "bg-orange-50 text-orange-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {loopMode === "single" ? (
            <Repeat1 className="h-4 w-4" />
          ) : loopMode === "all" ? (
            <Repeat className="h-4 w-4" />
          ) : loopMode === "times" ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Repeat className="h-4 w-4" />
          )}
          {loopLabel[loopMode]}
        </button>

        {loopMode === "times" && (
          <select
            value={loopCount}
            onChange={(e) => {
              setLoopCount(Number(e.target.value));
              setCurrentLoopN(0);
            }}
            className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
          >
            {[2, 3, 5, 10].map((n) => (
              <option key={n} value={n}>
                {n} 遍
              </option>
            ))}
          </select>
        )}

        {loopMode === "times" && currentLoopN > 0 && (
          <span className="text-xs text-orange-600">
            第 {currentLoopN + 1}/{loopCount} 遍
          </span>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowEnglish(!showEnglish)}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showEnglish
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {showEnglish ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            英文
          </button>
          <button
            onClick={() => setShowChinese(!showChinese)}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showChinese
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {showChinese ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            中文
          </button>
        </div>
      </div>

      {/* Transcript */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          文本对照
        </h2>
        {segments.length === 0 ? (
          <p className="text-sm text-gray-500">暂无文本内容</p>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {timedSegments.map((seg, i) => {
              const isActive = i === activeSegIndex;
              return (
                <div
                  key={seg.id}
                  ref={(el) => {
                    if (el) transcriptRefs.current.set(i, el);
                  }}
                  onClick={() => {
                    if (seg.startTime !== null) {
                      seekTo(seg.startTime);
                      if (loopMode === "times") setCurrentLoopN(0);
                    }
                  }}
                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                    isActive
                      ? "bg-blue-50 ring-1 ring-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatTime(seg.startTime!)}
                    </span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  {showEnglish && (
                    <p
                      className={`text-sm leading-relaxed ${
                        isActive
                          ? "font-medium text-blue-900"
                          : "text-gray-800"
                      }`}
                    >
                      {seg.textEn}
                    </p>
                  )}
                  {showChinese && seg.textZh && (
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      {seg.textZh}
                    </p>
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
