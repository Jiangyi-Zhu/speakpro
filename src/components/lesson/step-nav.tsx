"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEARNING_STEPS } from "@/types";
import { useStudyTimer } from "@/hooks/use-study-timer";

const shortLabels: Record<string, string> = {
  video: "视频",
  vocabulary: "词汇",
  "word-study": "生词",
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

  const currentStepIndex = LEARNING_STEPS.findIndex((s) =>
    pathname?.includes(`/${s.key}`)
  );

  const derived = { ...completedSteps };
  for (let i = LEARNING_STEPS.length - 2; i >= 0; i--) {
    if (derived[LEARNING_STEPS[i + 1].key] && !derived[LEARNING_STEPS[i].key]) {
      derived[LEARNING_STEPS[i].key] = true;
    }
  }

  return (
    <nav className="flex items-center py-2">
      {LEARNING_STEPS.map((step, i) => {
        const href = `/lessons/${lessonId}/${step.key}`;
        const isActive = i === currentStepIndex;
        const isCompleted = !!derived[step.key];
        const prevCompleted = i > 0 && !!derived[LEARNING_STEPS[i - 1].key];

        return (
          <Fragment key={step.key}>
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition-colors",
                  prevCompleted ? "bg-brand-300" : "bg-gray-200"
                )}
              />
            )}
            <Link
              href={href}
              className="group flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all",
                  isActive
                    ? "bg-brand-600 text-white ring-4 ring-brand-100 scale-110"
                    : isCompleted
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  isActive
                    ? "text-brand-700"
                    : isCompleted
                      ? "text-brand-600"
                      : "text-gray-400"
                )}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{shortLabels[step.key]}</span>
              </span>
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
