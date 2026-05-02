"use client";

import { useCallback } from "react";

interface ProgressData {
  step: number;
  videoWatched?: boolean;
  vocabCompleted?: boolean;
  wordStudyCompleted?: boolean;
  sentencesCompleted?: boolean;
  expressionDone?: boolean;
  summaryGenerated?: boolean;
  completed?: boolean;
}

export function useProgress(lessonId: string) {
  const updateProgress = useCallback(
    (data: ProgressData) => {
      const payload = JSON.stringify({ lessonId, ...data });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/progress", blob);
      } else {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    },
    [lessonId]
  );

  return { updateProgress };
}
