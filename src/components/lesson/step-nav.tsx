"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play, BookOpen, Mic, MessageSquare, Award, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEARNING_STEPS } from "@/types";
import { useStudyTimer } from "@/hooks/use-study-timer";

const iconMap = {
  Play,
  BookOpen,
  Mic,
  MessageSquare,
  Award,
};

const shortLabels: Record<string, string> = {
  video: "视频",
  vocabulary: "词汇",
  sentences: "跟读",
  expression: "表达",
  summary: "总结",
};

interface StepNavProps {
  lessonId: string;
  completedSteps?: Record<string, boolean>;
}

export function StepNav({ lessonId, completedSteps = {} }: StepNavProps) {
  const pathname = usePathname();
  useStudyTimer();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
      {LEARNING_STEPS.map((step, i) => {
        const Icon = iconMap[step.icon];
        const href = `/lessons/${lessonId}/${step.key}`;
        const isActive = pathname?.includes(`/${step.key}`);
        const isCompleted = completedSteps[step.key];

        return (
          <Link
            key={step.key}
            href={href}
            className={cn(
              "relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-white text-blue-700 shadow-sm"
                : isCompleted
                  ? "text-green-700 hover:bg-white/50"
                  : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
            )}
          >
            {isCompleted && !isActive ? (
              <Check className="h-4 w-4" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{shortLabels[step.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
