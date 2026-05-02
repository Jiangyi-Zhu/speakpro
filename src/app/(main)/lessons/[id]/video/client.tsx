"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Repeat,
  Repeat1,
  Play,
  Pause,
  RotateCcw,
  AlignJustify,
  List,
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

interface SegmentGroup {
  segments: Segment[];
  startTime: number;
  endTime: number;
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
  const [groupSize, setGroupSize] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);
  const prevGroupRef = useRef(-1);
  const userSeekRef = useRef(false);
  const loopModeRef = useRef(loopMode);
  const loopCountRef = useRef(loopCount);
  const currentLoopNRef = useRef(currentLoopN);
  loopModeRef.current = loopMode;
  loopCountRef.current = loopCount;
  currentLoopNRef.current = currentLoopN;

  const timedSegments = useMemo(
    () => segments.filter((s) => s.startTime !== null && s.endTime !== null),
    [segments]
  );

  const groups = useMemo(() => {
    const result: SegmentGroup[] = [];
    for (let i = 0; i < timedSegments.length; i += groupSize) {
      const chunk = timedSegments.slice(i, i + groupSize);
      result.push({
        segments: chunk,
        startTime: chunk[0].startTime!,
        endTime: chunk[chunk.length - 1].endTime!,
      });
    }
    return result;
  }, [timedSegments, groupSize]);

  const activeGroupIndex = useMemo(() => {
    if (activeSegIndex < 0) return -1;
    return Math.floor(activeSegIndex / groupSize);
  }, [activeSegIndex, groupSize]);

  useEffect(() => {
    prevGroupRef.current = -1;
  }, [groupSize]);

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

      const gi = idx >= 0 ? Math.floor(idx / groupSize) : -1;
      const mode = loopModeRef.current;

      if (userSeekRef.current) {
        userSeekRef.current = false;
        prevGroupRef.current = gi;
        return;
      }

      if (mode === "single" || mode === "times") {
        const loopGi = prevGroupRef.current;
        if (loopGi >= 0 && loopGi < groups.length) {
          const loopGroup = groups[loopGi];
          const crossed = gi !== loopGi;
          const nearEnd = t >= loopGroup.endTime - 0.2;

          if (crossed || nearEnd) {
            if (mode === "single") {
              video.currentTime = loopGroup.startTime;
              return;
            }
            if (mode === "times") {
              const next = currentLoopNRef.current + 1;
              if (next < loopCountRef.current) {
                currentLoopNRef.current = next;
                setCurrentLoopN(next);
                video.currentTime = loopGroup.startTime;
                return;
              } else {
                currentLoopNRef.current = 0;
                setCurrentLoopN(0);
                const nextGi = loopGi + 1;
                if (nextGi < groups.length) {
                  video.currentTime = groups[nextGi].startTime;
                  prevGroupRef.current = nextGi;
                } else {
                  prevGroupRef.current = -1;
                }
                return;
              }
            }
          }
        }
      }

      prevGroupRef.current = gi;
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      const mode = loopModeRef.current;
      if (mode === "all") {
        video.currentTime = 0;
        video.play();
      } else if (
        (mode === "single" || mode === "times") &&
        prevGroupRef.current >= 0
      ) {
        const loopGroup = groups[prevGroupRef.current];
        if (loopGroup) {
          video.currentTime = loopGroup.startTime;
          video.play();
        }
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
  }, [findActiveSegment, groups, groupSize]);

  useEffect(() => {
    if (activeGroupIndex >= 0) {
      const el = transcriptRefs.current.get(activeGroupIndex);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeGroupIndex]);

  function seekTo(time: number) {
    if (videoRef.current) {
      userSeekRef.current = true;
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

  function setSpeed(rate: number) {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
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
    single: groupSize === 1 ? "单句循环" : "段落循环",
    times: `循环 ${loopCount} 遍`,
    all: "全文循环",
  };

  return (
    <div className="space-y-4">
      {videoUrl && (
        <div className="overflow-hidden rounded-2xl bg-gray-900">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full"
            playsInline
            preload="metadata"
          />

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
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPlaying ? "暂停" : "播放"}
          </button>
        )}

        <select
          value={playbackRate}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className={`rounded-lg px-2 py-2 text-sm font-bold tabular-nums transition-colors ${
            playbackRate !== 1
              ? "bg-brand-50 text-brand-700 border-brand-200"
              : "bg-gray-100 text-gray-500 border-gray-300"
          } border`}
        >
          {[0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2].map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>

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
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            {[
              { size: 1, label: "逐句", icon: List },
              { size: 4, label: "段落", icon: AlignJustify },
            ].map(({ size, label, icon: Icon }) => (
              <button
                key={size}
                onClick={() => setGroupSize(size)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  groupSize === size
                    ? "bg-brand-600 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEnglish(!showEnglish)}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showEnglish
                ? "bg-brand-50 text-brand-700"
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
                ? "bg-brand-50 text-brand-700"
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
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          文本对照
        </h2>
        {segments.length === 0 ? (
          <p className="text-sm text-gray-500">暂无文本内容</p>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {groups.map((group, gi) => {
              const isActive = gi === activeGroupIndex;
              return (
                <div
                  key={group.segments[0].id}
                  ref={(el) => {
                    if (el) transcriptRefs.current.set(gi, el);
                  }}
                  onClick={() => {
                    seekTo(group.startTime);
                    if (loopMode === "times") setCurrentLoopN(0);
                  }}
                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                    isActive
                      ? "bg-brand-50 ring-1 ring-brand-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatTime(group.startTime)}
                    </span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                    )}
                  </div>
                  {group.segments.map((seg) => {
                    const segIsActive =
                      timedSegments.indexOf(seg) === activeSegIndex;
                    return (
                      <div
                        key={seg.id}
                        className={groupSize > 1 ? "mb-2 last:mb-0" : ""}
                      >
                        {showEnglish && (
                          <p
                            className={`text-sm leading-relaxed ${
                              segIsActive
                                ? "font-medium text-brand-900"
                                : isActive
                                  ? "text-brand-800"
                                  : "text-gray-800"
                            }`}
                          >
                            {seg.textEn}
                          </p>
                        )}
                        {showChinese && seg.textZh && (
                          <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
                            {seg.textZh}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
        >
          下一步：词汇预习
        </Link>
      </div>
    </div>
  );
}
