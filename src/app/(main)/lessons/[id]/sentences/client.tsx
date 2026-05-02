"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  Loader2,
  Play,
  ArrowRight,
  Pause,
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useProgress } from "@/hooks/use-progress";

interface Segment {
  id: string;
  index: number;
  textEn: string;
  textZh: string;
  grammarNote: string;
  audioUrl: string | null;
  startTime: number | null;
  endTime: number | null;
}

interface Props {
  lessonId: string;
  videoUrl: string | null;
  segments: Segment[];
  initialSavedSegmentIds?: string[];
  initialRecordings?: Record<string, string>;
}

export function SentencesStepClient({
  lessonId,
  videoUrl,
  segments,
  initialSavedSegmentIds = [],
  initialRecordings = {},
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [savedSegmentIds, setSavedSegmentIds] = useState<Set<string>>(
    new Set(initialSavedSegmentIds)
  );
  const [savingSentence, setSavingSentence] = useState(false);
  const [recordingsSaved, setRecordingsSaved] = useState<Set<number>>(() => {
    const set = new Set<number>();
    segments.forEach((seg, idx) => {
      if (initialRecordings[seg.id]) set.add(idx);
    });
    return set;
  });
  const [savingRecording, setSavingRecording] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [segmentAudioUrls, setSegmentAudioUrls] = useState<Map<number, string>>(
    () => {
      const map = new Map<number, string>();
      segments.forEach((seg, idx) => {
        if (initialRecordings[seg.id]) {
          map.set(idx, initialRecordings[seg.id]);
        }
      });
      return map;
    }
  );

  const recorder = useAudioRecorder();
  const { updateProgress } = useProgress(lessonId);
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const videoAudioRef = useRef<HTMLAudioElement | null>(null);
  const endTimeRef = useRef<number>(0);
  const recorderSegmentRef = useRef<number>(-1);
  const markedRef = useRef(false);

  const currentSegment = segments[currentIndex];
  const hasAudio =
    currentSegment?.audioUrl ||
    (videoUrl && currentSegment?.startTime != null);
  const currentRecordingUrl = segmentAudioUrls.get(currentIndex);

  useEffect(() => {
    if (!videoUrl) return;
    const audio = new Audio(videoUrl);
    audio.preload = "auto";
    const onTimeUpdate = () => {
      if (endTimeRef.current > 0 && audio.currentTime >= endTimeRef.current) {
        audio.pause();
        endTimeRef.current = 0;
        setIsPlayingOriginal(false);
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", () => setIsPlayingOriginal(false));
    videoAudioRef.current = audio;
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.pause();
    };
  }, [videoUrl]);

  function stopOriginalAudio() {
    if (videoAudioRef.current) {
      videoAudioRef.current.pause();
      endTimeRef.current = 0;
    }
    originalAudioRef.current?.pause();
    setIsPlayingOriginal(false);
  }

  function playSegmentAudio(seg: Segment) {
    stopOriginalAudio();

    if (seg.audioUrl && originalAudioRef.current) {
      setIsPlayingOriginal(true);
      originalAudioRef.current.currentTime = 0;
      originalAudioRef.current.play().catch(() => {});
      originalAudioRef.current.onended = () => setIsPlayingOriginal(false);
      return;
    }

    if (!videoAudioRef.current || seg.startTime == null || seg.endTime == null)
      return;

    const audio = videoAudioRef.current;
    audio.currentTime = seg.startTime;
    endTimeRef.current = seg.endTime;
    setIsPlayingOriginal(true);
    audio.play().catch(() => setIsPlayingOriginal(false));
  }

  async function toggleSave() {
    const segmentId = currentSegment.id;
    const isSaved = savedSegmentIds.has(segmentId);
    setSavingSentence(true);

    try {
      if (isSaved) {
        await fetch("/api/saved-sentences", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segmentId }),
        });
        setSavedSegmentIds((prev) => {
          const next = new Set(prev);
          next.delete(segmentId);
          return next;
        });
      } else {
        await fetch("/api/saved-sentences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, segmentId }),
        });
        setSavedSegmentIds((prev) => new Set([...prev, segmentId]));
      }
    } catch {
      // ignore
    }

    setSavingSentence(false);
  }

  const saveRecording = useCallback(
    async (blob: Blob, segId: string, idx: number) => {
      setSavingRecording(true);
      try {
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");
        formData.append("lessonId", lessonId);
        formData.append("segmentId", segId);
        formData.append("duration", String(recorder.duration));

        const res = await fetch("/api/upload-recording", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setRecordingsSaved((prev) => new Set([...prev, idx]));
        }
      } catch {
        // ignore
      }
      setSavingRecording(false);
    },
    [lessonId, recorder.duration]
  );

  useEffect(() => {
    if (recorder.audioBlob && !recorder.isRecording) {
      const idx = recorderSegmentRef.current;
      if (idx >= 0 && idx < segments.length) {
        const url = URL.createObjectURL(recorder.audioBlob);
        setSegmentAudioUrls((prev) => new Map(prev).set(idx, url));
        if (!recordingsSaved.has(idx)) {
          saveRecording(recorder.audioBlob, segments[idx].id, idx);
        }
      }
    }
  }, [recorder.audioBlob, recorder.isRecording, segments, saveRecording, recordingsSaved]);

  function startRecording() {
    stopOriginalAudio();
    recorderSegmentRef.current = currentIndex;
    recorder.startRecording();
  }

  function handleReRecord() {
    setSegmentAudioUrls((prev) => {
      const next = new Map(prev);
      next.delete(currentIndex);
      return next;
    });
    setRecordingsSaved((prev) => {
      const next = new Set(prev);
      next.delete(currentIndex);
      return next;
    });
    recorder.resetRecording();
  }

  function goNext() {
    if (currentIndex < segments.length - 1) {
      setCurrentIndex(currentIndex + 1);
      stopOriginalAudio();
      if (recorder.isRecording) recorder.stopRecording();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      stopOriginalAudio();
      if (recorder.isRecording) recorder.stopRecording();
    }
  }

  if (segments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">暂无句子内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sentence Card */}
      <div className="rounded-2xl bg-white shadow-sm p-6">
        {/* Progress + Save */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            {currentIndex + 1} / {segments.length}
          </span>
          <button
            onClick={toggleSave}
            disabled={savingSentence}
            className="text-gray-400 hover:text-yellow-500"
          >
            {savedSegmentIds.has(currentSegment.id) ? (
              <BookmarkCheck className="h-5 w-5 text-yellow-500" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / segments.length) * 100}%`,
            }}
          />
        </div>

        {/* English */}
        <p className="mb-2 text-lg font-medium leading-relaxed text-gray-900">
          {currentSegment.textEn}
        </p>

        {/* Chinese */}
        {showTranslation && currentSegment.textZh && (
          <p className="mb-4 text-sm text-gray-500">{currentSegment.textZh}</p>
        )}

        {/* Audio row: Play original + Record together */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
          {/* Play original */}
          {hasAudio ? (
            <button
              onClick={() =>
                isPlayingOriginal
                  ? stopOriginalAudio()
                  : playSegmentAudio(currentSegment)
              }
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
                isPlayingOriginal
                  ? "bg-orange-500"
                  : "bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {isPlayingOriginal ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400">
              <Play className="h-4 w-4" />
            </div>
          )}
          <span className="text-sm text-gray-500">
            {isPlayingOriginal ? "播放中" : "原音"}
          </span>
          {currentSegment.audioUrl && (
            <audio ref={originalAudioRef} src={currentSegment.audioUrl} />
          )}

          <div className="mx-1 h-6 w-px bg-gray-200" />

          {/* Record */}
          <button
            onClick={
              recorder.isRecording ? recorder.stopRecording : startRecording
            }
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
              recorder.isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {recorder.isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
          <span className="text-sm text-gray-500">
            {recorder.isRecording ? `${recorder.duration}s` : "跟读"}
          </span>

          {currentRecordingUrl && !recorder.isRecording && (
            <Check className="ml-auto h-4 w-4 text-green-600" />
          )}
        </div>

        {/* Recording playback */}
        {currentRecordingUrl && !recorder.isRecording && (
          <div className="mt-3 flex items-center gap-3">
            <audio
              src={currentRecordingUrl}
              controls
              className="h-9 flex-1"
            />
            <button
              onClick={handleReRecord}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw className="h-3 w-3" />
              重录
            </button>
            {savingRecording && recorderSegmentRef.current === currentIndex && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
            )}
          </div>
        )}

        {recorder.error && (
          <p className="mt-2 text-sm text-red-500">{recorder.error}</p>
        )}

        {/* Grammar Note */}
        {currentSegment.grammarNote && (
          <div className="mt-4 rounded-lg bg-brand-50 p-4">
            <p className="mb-1 text-xs font-semibold text-brand-600">
              语法解析
            </p>
            <p className="text-sm leading-relaxed text-brand-800">
              {currentSegment.grammarNote}
            </p>
          </div>
        )}

        {/* Translation toggle */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`text-xs font-medium transition-colors ${
              showTranslation ? "text-brand-600" : "text-gray-400"
            }`}
          >
            {showTranslation ? "隐藏翻译" : "显示翻译"}
          </button>
        </div>

        {/* Sentence Navigation */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            disabled={currentIndex === 0}
            onClick={goPrev}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            上一句
          </button>
          {currentIndex === segments.length - 1 ? (
            <Link
              href={`/lessons/${lessonId}/expression`}
              onClick={() => {
                if (!markedRef.current) {
                  markedRef.current = true;
                  updateProgress({ step: 4, sentencesCompleted: true });
                }
              }}
              className="flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
            >
              下一步：自由表达
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50"
            >
              下一句
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lessonId}/word-study`}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
        >
          上一步
        </Link>
        <Link
          href={`/lessons/${lessonId}/expression`}
          onClick={() =>
            updateProgress({ step: 4, sentencesCompleted: true })
          }
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          跳过跟读
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
