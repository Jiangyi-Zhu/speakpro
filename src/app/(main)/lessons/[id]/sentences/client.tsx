"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Save,
  Check,
  Loader2,
  Play,
  ArrowRight,
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
}

interface Props {
  lessonId: string;
  segments: Segment[];
  initialSavedSegmentIds?: string[];
}

export function SentencesStepClient({ lessonId, segments, initialSavedSegmentIds = [] }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showGrammar, setShowGrammar] = useState(false);
  const [savedSegmentIds, setSavedSegmentIds] = useState<Set<string>>(
    new Set(initialSavedSegmentIds)
  );
  const [savingSentence, setSavingSentence] = useState(false);
  const [recordingsSaved, setRecordingsSaved] = useState<Set<number>>(new Set());
  const [savingRecording, setSavingRecording] = useState(false);

  const recorder = useAudioRecorder();
  const { updateProgress } = useProgress(lessonId);
  const originalAudioRef = useRef<HTMLAudioElement>(null);

  const currentSegment = segments[currentIndex];

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
      // ignore - user may not be logged in
    }

    setSavingSentence(false);
  }

  async function saveRecording() {
    if (!recorder.audioBlob) return;
    setSavingRecording(true);

    try {
      const formData = new FormData();
      formData.append("file", recorder.audioBlob, "recording.webm");
      formData.append("lessonId", lessonId);
      formData.append("segmentId", currentSegment.id);
      formData.append("duration", String(recorder.duration));

      const res = await fetch("/api/upload-recording", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setRecordingsSaved((prev) => new Set([...prev, currentIndex]));
      }
    } catch {
      // ignore
    }

    setSavingRecording(false);
  }

  function goNext() {
    if (currentIndex < segments.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (recorder.isRecording) recorder.stopRecording();
      recorder.resetRecording();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (recorder.isRecording) recorder.stopRecording();
      recorder.resetRecording();
    }
  }

  if (segments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">暂无句子内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            showTranslation ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {showTranslation ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          中文翻译
        </button>
        <button
          onClick={() => setShowGrammar(!showGrammar)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            showGrammar ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          语法解析
        </button>
      </div>

      {/* Sentence Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
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
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / segments.length) * 100}%` }}
          />
        </div>

        {/* English */}
        <p className="mb-3 text-lg font-medium leading-relaxed text-gray-900">
          {currentSegment.textEn}
        </p>

        {/* Chinese */}
        {showTranslation && currentSegment.textZh && (
          <p className="mb-3 text-base text-gray-500">{currentSegment.textZh}</p>
        )}

        {/* Grammar */}
        {showGrammar && currentSegment.grammarNote && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm leading-relaxed text-blue-800">
            {currentSegment.grammarNote}
          </div>
        )}

        {/* Original Audio */}
        {currentSegment.audioUrl && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <button
              onClick={() => originalAudioRef.current?.play()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm text-gray-500">播放原音</span>
            <audio ref={originalAudioRef} src={currentSegment.audioUrl} />
          </div>
        )}

        {/* Recording Controls */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* Record Button */}
          <button
            onClick={
              recorder.isRecording ? recorder.stopRecording : recorder.startRecording
            }
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-all ${
              recorder.isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                : "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
            }`}
          >
            {recorder.isRecording ? (
              <Square className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>

          {recorder.isRecording && (
            <p className="text-sm font-medium text-red-500">
              录音中... {recorder.duration}s
            </p>
          )}

          {/* Playback + Save */}
          {recorder.audioUrl && !recorder.isRecording && (
            <div className="flex flex-col items-center gap-3">
              <audio src={recorder.audioUrl} controls className="h-10" />
              <div className="flex gap-2">
                <button
                  onClick={recorder.resetRecording}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  重录
                </button>
                {!recordingsSaved.has(currentIndex) && (
                  <button
                    onClick={saveRecording}
                    disabled={savingRecording}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {savingRecording ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    保存
                  </button>
                )}
                {recordingsSaved.has(currentIndex) && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                    <Check className="h-3.5 w-3.5" />
                    已保存
                  </span>
                )}
              </div>
            </div>
          )}

          {!recorder.isRecording && !recorder.audioUrl && !recorder.error && (
            <p className="text-sm text-gray-400">点击麦克风按钮开始跟读</p>
          )}

          {recorder.error && (
            <p className="text-sm text-red-500">{recorder.error}</p>
          )}
        </div>

        {/* Sentence Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
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
              onClick={() => updateProgress({ step: 3, sentencesCompleted: true })}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              下一步：自由表达
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
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
          href={`/lessons/${lessonId}/vocabulary`}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          上一步
        </Link>
        <Link
          href={`/lessons/${lessonId}/expression`}
          onClick={() => updateProgress({ step: 3, sentencesCompleted: true })}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          跳过跟读
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
