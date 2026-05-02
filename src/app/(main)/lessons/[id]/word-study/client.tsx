"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Eye,
  Volume2,
  Loader2,
} from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

interface Segment {
  id: string;
  textEn: string;
  textZh: string;
}

interface DictEntry {
  word: string;
  phonetic: string;
  audioUrl: string;
  translation: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{ definition: string; example: string | null }>;
  }>;
}

interface Props {
  lessonId: string;
  segments: Segment[];
  savedWords: string[];
}

function findWordContext(word: string, segments: Segment[]) {
  for (const seg of segments) {
    if (seg.textEn.toLowerCase().includes(word.toLowerCase())) {
      return seg;
    }
  }
  return null;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightWord(text: string, word: string) {
  const regex = new RegExp(`(\\b${escapeRegex(word)}\\b)`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span
        key={i}
        className="rounded bg-yellow-200 px-0.5 font-semibold text-yellow-900"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function WordStudyClient({ lessonId, segments, savedWords }: Props) {
  const [learnIndex, setLearnIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [dictCache, setDictCache] = useState<Map<string, DictEntry | null>>(
    new Map()
  );
  const [dictLoading, setDictLoading] = useState(false);
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentWord = savedWords[learnIndex];
  const currentContext = currentWord
    ? findWordContext(currentWord, segments)
    : null;
  const currentDict = currentWord ? dictCache.get(currentWord) : undefined;

  useEffect(() => {
    if (!currentWord) return;
    if (dictCache.has(currentWord)) return;
    setDictLoading(true);
    fetch(`/api/dictionary?word=${encodeURIComponent(currentWord)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setDictCache((prev) => new Map(prev).set(currentWord, data));
      })
      .catch(() => {
        setDictCache((prev) => new Map(prev).set(currentWord, null));
      })
      .finally(() => setDictLoading(false));
  }, [currentWord, dictCache]);

  function playAudio(url: string) {
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
  }

  function nextCard() {
    setShowMeaning(false);
    if (learnIndex < savedWords.length - 1) setLearnIndex(learnIndex + 1);
  }

  function prevCard() {
    setShowMeaning(false);
    if (learnIndex > 0) setLearnIndex(learnIndex - 1);
  }

  if (savedWords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-sm p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="mb-1 text-base font-medium text-gray-900">没有生词</p>
          <p className="text-sm text-gray-400">
            返回上一步标记生词，或直接进入下一步
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Link
            href={`/lessons/${lessonId}/vocabulary`}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
          >
            返回标记
          </Link>
          <Link
            href={`/lessons/${lessonId}/sentences`}
            onClick={() => {
              if (!markedRef.current) {
                markedRef.current = true;
                updateProgress({ step: 3, wordStudyCompleted: true });
              }
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            下一步：句子跟读
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm p-6">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            学习生词 {learnIndex + 1} / {savedWords.length}
          </span>
          <Link
            href={`/lessons/${lessonId}/vocabulary`}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            返回标记
          </Link>
        </div>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{
              width: `${((learnIndex + 1) / savedWords.length) * 100}%`,
            }}
          />
        </div>

        {/* Flashcard */}
        {currentWord && (
          <div className="py-4">
            {/* Word + Phonetic + Audio */}
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-gray-900">{currentWord}</h2>
              {dictLoading && (
                <Loader2 className="mx-auto mt-2 h-4 w-4 animate-spin text-gray-300" />
              )}
              {currentDict && (
                <div className="mt-2 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    {currentDict.phonetic && (
                      <span className="text-sm text-gray-400">
                        {currentDict.phonetic}
                      </span>
                    )}
                    {currentDict.audioUrl && (
                      <button
                        onClick={() => playAudio(currentDict.audioUrl)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {currentDict.translation && (
                    <p className="text-base font-medium text-brand-700">
                      {currentDict.translation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Definitions */}
            {currentDict && currentDict.meanings.length > 0 && (
              <div className="mb-4 space-y-3">
                {currentDict.meanings.map((m, mi) => (
                  <div key={mi}>
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {m.partOfSpeech}
                    </span>
                    {m.definitions.map((d, di) => (
                      <div key={di} className="mt-1.5 pl-2">
                        <p className="text-sm leading-relaxed text-gray-700">
                          {d.definition}
                        </p>
                        {d.example && (
                          <p className="mt-0.5 text-xs italic text-gray-400">
                            {d.example}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Context sentence */}
            {currentContext && (
              <div
                className={`rounded-xl p-5 transition-all ${
                  showMeaning ? "bg-brand-50" : "bg-gray-50"
                }`}
              >
                <p className="mb-1 text-xs font-medium text-gray-400">
                  原文语境
                </p>
                <p className="text-base leading-relaxed text-gray-800">
                  {highlightWord(currentContext.textEn, currentWord)}
                </p>

                {showMeaning ? (
                  <div className="mt-3 border-t border-brand-200 pt-3">
                    <p className="text-sm leading-relaxed text-brand-800">
                      {currentContext.textZh}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMeaning(true)}
                    className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    <Eye className="h-4 w-4" />
                    查看中文翻译
                  </button>
                )}
              </div>
            )}

            {!currentContext && (
              <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                该单词未在课文中找到上下文
              </div>
            )}
          </div>
        )}

        {/* Card Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            disabled={learnIndex === 0}
            onClick={prevCard}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            上一个
          </button>
          {learnIndex < savedWords.length - 1 ? (
            <button
              onClick={nextCard}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50"
            >
              下一个
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-xs text-gray-400">已是最后一个</span>
          )}
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lessonId}/vocabulary`}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
        >
          上一步
        </Link>
        <Link
          href={`/lessons/${lessonId}/sentences`}
          onClick={() => {
            if (!markedRef.current) {
              markedRef.current = true;
              updateProgress({ step: 3, wordStudyCompleted: true });
            }
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
        >
          下一步：句子跟读
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
