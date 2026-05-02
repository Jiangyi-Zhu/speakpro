"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

interface QuestionForm {
  question: string;
  hint: string;
}

export default function NewLessonPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [category, setCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);

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

  async function handleSave() {
    setSaving(true);

    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        difficulty,
        category,
        videoUrl: videoUrl || undefined,
        published,
      }),
    });
    const lesson = await res.json();

    if (questions.length > 0) {
      await fetch(`/api/lessons/${lesson.id}/questions`, {
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
    router.push(`/admin/lessons/${lesson.id}/edit`);
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
        <h1 className="text-2xl font-bold text-gray-900">新建课程</h1>
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
                  placeholder="https://..."
                />
              </div>
            </div>
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
              保存后可导入字幕和添加段落
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
            {saving ? "保存中..." : "创建课程"}
          </button>
        </div>
      </div>
    </div>
  );
}
