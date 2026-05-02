import type { Lesson, LessonSegment, UserProgress, VocabularyItem } from "@prisma/client";

export type LessonWithSegments = Lesson & {
  segments: LessonSegment[];
};

export type LessonWithProgress = Lesson & {
  progress: UserProgress[];
};

export type LessonFull = Lesson & {
  segments: LessonSegment[];
  progress: UserProgress[];
};

export type VocabularyWithLesson = VocabularyItem & {
  lesson: Lesson | null;
};

export const LEARNING_STEPS = [
  { step: 1, key: "video", label: "视频学习", icon: "Play" },
  { step: 2, key: "vocabulary", label: "词汇预习", icon: "BookOpen" },
  { step: 3, key: "word-study", label: "学习生词", icon: "GraduationCap" },
  { step: 4, key: "sentences", label: "句子跟读", icon: "Mic" },
  { step: 5, key: "expression", label: "自由表达", icon: "MessageSquare" },
  { step: 6, key: "summary", label: "学习总结", icon: "Award" },
] as const;

export type LearningStepKey = (typeof LEARNING_STEPS)[number]["key"];

export const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "入门",
  INTERMEDIATE: "中级",
  ADVANCED: "高级",
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
