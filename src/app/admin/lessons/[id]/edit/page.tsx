"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  FileText,
  Loader2,
  Check,
  Link as LinkIcon,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface SegmentForm {
  index: number;
  textEn: string;
  textZh: string;
  grammarNote: string;
  startTime: string;
  endTime: string;
}

interface QuestionForm {
  question: string;
  hint: string;
}

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const isNew = lessonId === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [category, setCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [segments, setSegments] = useState<SegmentForm[]>([]);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [published, setPublished] = useState(false);

  // Load existing lesson data
  useEffect(() => {
    if (isNew) return;
    fetch(`/api/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setDifficulty(data.difficulty || "INTERMEDIATE");
        setCategory(data.category || "");
        setVideoUrl(data.videoUrl || "");
        setPublished(data.published || false);
        if (data.segments) {
          setSegments(
            data.segments.map((s: any) => ({
              index: s.index,
              textEn: s.textEn || "",
              textZh: s.textZh || "",
              grammarNote: s.grammarNote || "",
              startTime: s.startTime?.toString() || "",
              endTime: s.endTime?.toString() || "",
            }))
          );
        }
        if (data.questions) {
          setQuestions(
            data.questions.map((q: any) => ({
              question: q.question || "",
              hint: q.hint || "",
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isNew, lessonId]);

  function addSegment() {
    setSegments([
      ...segments,
      {
        index: segments.length,
        textEn: "",
        textZh: "",
        grammarNote: "",
        startTime: "",
        endTime: "",
      },
    ]);
  }

  function updateSegment(i: number, field: keyof SegmentForm, value: string) {
    const updated = [...segments];
    updated[i] = { ...updated[i], [field]: value };
    setSegments(updated);
  }

  function removeSegment(i: number) {
    setSegments(segments.filter((_, idx) => idx !== i));
  }

  function addQuestion() {
    setQuestions([...questions, { question: "", hint: "" }]);
  }

  function updateQuestion(i: number, field: keyof QuestionForm, value: string) {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: value };
    setQuestions(updated);
  }

  function removeQuestion(i: number) {
    setQuestions(questions.filter((_, idx) => idx !== i));
  }

  async function handleSubtitleImport(
    e: React.ChangeEvent<HTMLInputElement>,
    lang: "en" | "zh"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isNew) {
      setImportMsg("请先保存课程基本信息，再导入字幕");
      return;
    }

    setImporting(true);
    setImportMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", lang);

    try {
      const res = await fetch(`/api/lessons/${lessonId}/import-subtitle`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setImportMsg(`导入成功：${data.message}`);
        // Reload segments
        const lessonRes = await fetch(`/api/lessons/${lessonId}`);
        const lessonData = await lessonRes.json();
        if (lessonData.segments) {
          setSegments(
            lessonData.segments.map((s: any) => ({
              index: s.index,
              textEn: s.textEn || "",
              textZh: s.textZh || "",
              grammarNote: s.grammarNote || "",
              startTime: s.startTime?.toString() || "",
              endTime: s.endTime?.toString() || "",
            }))
          );
        }
      } else {
        setImportMsg(`导入失败：${data.error}`);
      }
    } catch {
      setImportMsg("导入失败：网络错误");
    }

    setImporting(false);
    e.target.value = "";
  }

  async function handleSave() {
    setSaving(true);

    const lessonData = {
      title,
      description,
      difficulty,
      category,
      videoUrl: videoUrl || undefined,
      published,
    };

    let id = lessonId;

    if (isNew) {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonData),
      });
      const lesson = await res.json();
      id = lesson.id;
    } else {
      await fetch(`/api/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonData),
      });
    }

    if (segments.length > 0 && isNew) {
      await fetch(`/api/lessons/${id}/segments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          segments.map((s, i) => ({
            index: i,
            textEn: s.textEn,
            textZh: s.textZh || undefined,
            grammarNote: s.grammarNote || undefined,
            startTime: s.startTime ? parseFloat(s.startTime) : undefined,
            endTime: s.endTime ? parseFloat(s.endTime) : undefined,
          }))
        ),
      });
    }

    if (questions.length > 0) {
      await fetch(`/api/lessons/${id}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          questions.map((q, i) => ({
            question: q.question,
            hint: q.hint || undefined,
            sortOrder: i,
          }))
        ),
      });
    }

    setSaving(false);
    router.push("/admin/lessons");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/lessons"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "新建课程" : "编辑课程"}
        </h1>
        {!isNew && (
          <Link
            href={`/lessons/${lessonId}`}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            预览
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                课程标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="例如：Job Interview Skills"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  难度
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                >
                  <option value="BEGINNER">入门</option>
                  <option value="INTERMEDIATE">中级</option>
                  <option value="ADVANCED">高级</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  分类
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="面试、会议、邮件..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">发布课程</span>
              </label>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">视频设置</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              视频 URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="https://... (支持 MP4 直链、YouTube 等)"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              支持 MP4 直链、YouTube、Vimeo 等视频链接
            </p>
          </div>
        </div>

        {/* Subtitle Import */}
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">字幕导入</h2>
          <p className="mb-4 text-sm text-gray-500">
            上传 SRT 或 VTT 字幕文件，自动解析为逐句内容
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 transition-colors hover:border-brand-400 hover:text-brand-600">
              <FileText className="h-4 w-4" />
              导入英文字幕
              <input
                type="file"
                accept=".srt,.vtt"
                className="hidden"
                onChange={(e) => handleSubtitleImport(e, "en")}
                disabled={importing}
              />
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 transition-colors hover:border-brand-400 hover:text-brand-600">
              <FileText className="h-4 w-4" />
              导入中文字幕
              <input
                type="file"
                accept=".srt,.vtt"
                className="hidden"
                onChange={(e) => handleSubtitleImport(e, "zh")}
                disabled={importing}
              />
            </label>
          </div>
          {importing && (
            <div className="mt-3 flex items-center gap-2 text-sm text-brand-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在导入...
            </div>
          )}
          {importMsg && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
                importMsg.includes("成功")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {importMsg.includes("成功") ? (
                <Check className="h-4 w-4" />
              ) : null}
              {importMsg}
            </div>
          )}
        </div>

        {/* Segments */}
        <div className="rounded-xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              逐句内容（{segments.length} 句）
            </h2>
            <button
              onClick={addSegment}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              添加句子
            </button>
          </div>

          {segments.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">
              导入字幕文件或手动添加句子
            </p>
          ) : (
            <div className="space-y-4">
              {segments.map((seg, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      #{i + 1}
                      {seg.startTime && seg.endTime && (
                        <span className="ml-2 text-gray-300">
                          {seg.startTime}s - {seg.endTime}s
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => removeSegment(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      value={seg.textEn}
                      onChange={(e) => updateSegment(i, "textEn", e.target.value)}
                      rows={2}
                      placeholder="英文原文"
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    />
                    <textarea
                      value={seg.textZh}
                      onChange={(e) => updateSegment(i, "textZh", e.target.value)}
                      rows={2}
                      placeholder="中文翻译"
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    />
                    <textarea
                      value={seg.grammarNote}
                      onChange={(e) => updateSegment(i, "grammarNote", e.target.value)}
                      rows={1}
                      placeholder="语法解析（可选）"
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expression Questions */}
        <div className="rounded-xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              表达问题（{questions.length} 题）
            </h2>
            <button
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              添加问题
            </button>
          </div>

          {questions.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">
              添加自由表达环节的问题
            </p>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      问题 #{i + 1}
                    </span>
                    <button
                      onClick={() => removeQuestion(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      value={q.question}
                      onChange={(e) => updateQuestion(i, "question", e.target.value)}
                      placeholder="问题内容（英文）"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    />
                    <input
                      value={q.hint}
                      onChange={(e) => updateQuestion(i, "hint", e.target.value)}
                      placeholder="提示/引导（可选）"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3 pb-8">
          <Link
            href="/admin/lessons"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-[0_2px_0_0_#E5E7EB] transition-all hover:bg-gray-50 active:translate-y-0.5 active:shadow-none"
          >
            取消
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#2C524A] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "保存中..." : "保存课程"}
          </button>
        </div>
      </div>
    </div>
  );
}
