"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Eye,
  Volume2,
} from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

interface Segment {
  id: string;
  textEn: string;
  textZh: string;
}

interface SavedWord {
  word: string;
  status: "saving" | "saved" | "error";
}

interface DictEntry {
  word: string;
  phonetic: string;
  audioUrl: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{ definition: string; example: string | null }>;
  }>;
}

interface Props {
  lessonId: string;
  segments: Segment[];
}

function findWordContext(word: string, segments: Segment[]) {
  for (const seg of segments) {
    const lower = seg.textEn.toLowerCase();
    if (lower.includes(word.toLowerCase())) {
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
      <span key={i} className="rounded bg-yellow-200 px-0.5 font-semibold text-yellow-900">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function VocabularyStepClient({ lessonId, segments }: Props) {
  const [savedWords, setSavedWords] = useState<Map<string, SavedWord>>(new Map());
  const [phase, setPhase] = useState<"mark" | "learn">("mark");
  const [learnIndex, setLearnIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [dictCache, setDictCache] = useState<Map<string, DictEntry | null>>(new Map());
  const [dictLoading, setDictLoading] = useState(false);
  const { updateProgress } = useProgress(lessonId);
  const markedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const wordList = Array.from(savedWords.values());
  const currentWord = wordList[learnIndex];

  useEffect(() => {
    if (phase !== "learn" || !currentWord) return;
    const w = currentWord.word;
    if (dictCache.has(w)) return;
    setDictLoading(true);
    fetch(`/api/dictionary?word=${encodeURIComponent(w)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setDictCache((prev) => new Map(prev).set(w, data));
      })
      .catch(() => {
        setDictCache((prev) => new Map(prev).set(w, null));
      })
      .finally(() => setDictLoading(false));
  }, [phase, learnIndex, currentWord, dictCache]);

  function playAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
  }

  const handleWordClick = useCallback(
    (token: string) => {
      const cleaned = token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
      if (!cleaned || cleaned.length < 2) return;

      setSavedWords((prev) => {
        if (prev.has(cleaned)) {
          const next = new Map(prev);
          next.delete(cleaned);
          fetch("/api/vocabulary", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: cleaned }),
          }).catch(() => {});
          return next;
        }

        const next = new Map(prev);
        next.set(cleaned, { word: cleaned, status: "saving" });

        fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: cleaned, lessonId }),
        })
          .then((res) => {
            setSavedWords((p) => {
              const u = new Map(p);
              if (u.has(cleaned)) {
                u.set(cleaned, { word: cleaned, status: res.ok ? "saved" : "error" });
              }
              return u;
            });
          })
          .catch(() => {
            setSavedWords((p) => {
              const u = new Map(p);
              if (u.has(cleaned)) {
                u.set(cleaned, { word: cleaned, status: "error" });
              }
              return u;
            });
          });

        return next;
      });
    },
    [lessonId]
  );

  const currentContext = currentWord ? findWordContext(currentWord.word, segments) : null;
  const currentDict = currentWord ? dictCache.get(currentWord.word) : undefined;

  function startLearning() {
    if (wordList.length === 0) return;
    setPhase("learn");
    setLearnIndex(0);
    setShowMeaning(false);
  }

  function nextCard() {
    setShowMeaning(false);
    if (learnIndex < wordList.length - 1) {
      setLearnIndex(learnIndex + 1);
    }
  }

  function prevCard() {
    setShowMeaning(false);
    if (learnIndex > 0) {
      setLearnIndex(learnIndex - 1);
    }
  }

  // Phase 1: Mark words
  if (phase === "mark") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">阅读文章，点击标记生词</h2>
          </div>

          <div className="space-y-4">
            {segments.map((seg) => (
              <div key={seg.id} className="rounded-lg p-3 hover:bg-gray-50">
                <p className="text-sm leading-relaxed text-gray-800">
                  {seg.textEn.split(/(\s+)/).map((token, i) => {
                    const cleaned = token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
                    const isMarked = savedWords.has(cleaned);
                    if (!token.trim()) return token;
                    return (
                      <span
                        key={i}
                        onClick={() => handleWordClick(token)}
                        className={`cursor-pointer rounded px-0.5 transition-colors ${
                          isMarked
                            ? "bg-yellow-200 text-yellow-900"
                            : "hover:bg-brand-100"
                        }`}
                      >
                        {token}
                      </span>
                    );
                  })}
                </p>
              </div>
            ))}
          </div>

          {wordList.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {wordList.map((w) => (
                <span
                  key={w.word}
                  className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800"
                >
                  {w.status === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
                  {w.status === "saved" && <Check className="h-3 w-3 text-green-600" />}
                  {w.word}
                  <button
                    onClick={() => handleWordClick(w.word)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-yellow-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/lessons/${lessonId}/video`}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
          >
            上一步
          </Link>
          {wordList.length > 0 ? (
            <button
              onClick={startLearning}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
            >
              开始学习生词 ({wordList.length})
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={`/lessons/${lessonId}/sentences`}
              onClick={() => {
                if (!markedRef.current) {
                  markedRef.current = true;
                  updateProgress({ step: 2, vocabCompleted: true });
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
            >
              没有生词，下一步
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Phase 2: Learn words (flashcard style)
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm p-6">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            学习生词 {learnIndex + 1} / {wordList.length}
          </span>
          <button
            onClick={() => setPhase("mark")}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            返回标记
          </button>
        </div>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${((learnIndex + 1) / wordList.length) * 100}%` }}
          />
        </div>

        {/* Flashcard */}
        {currentWord && (
          <div className="py-4">
            {/* Word + Phonetic + Audio */}
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-gray-900">{currentWord.word}</h2>
              {dictLoading && (
                <Loader2 className="mx-auto mt-2 h-4 w-4 animate-spin text-gray-300" />
              )}
              {currentDict && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  {currentDict.phonetic && (
                    <span className="text-sm text-gray-400">{currentDict.phonetic}</span>
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
                        <p className="text-sm leading-relaxed text-gray-700">{d.definition}</p>
                        {d.example && (
                          <p className="mt-0.5 text-xs italic text-gray-400">{d.example}</p>
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
                <p className="mb-1 text-xs font-medium text-gray-400">原文语境</p>
                <p className="text-base leading-relaxed text-gray-800">
                  {highlightWord(currentContext.textEn, currentWord.word)}
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
          {learnIndex === wordList.length - 1 ? (
            <Link
              href={`/lessons/${lessonId}/sentences`}
              onClick={() => {
                if (!markedRef.current) {
                  markedRef.current = true;
                  updateProgress({ step: 2, vocabCompleted: true });
                }
              }}
              className="flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
            >
              学完了，下一步
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={nextCard}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50"
            >
              下一个
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
