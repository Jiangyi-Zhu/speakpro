"use client";

import { useEffect, useRef } from "react";

export function useStudyTimer() {
  const activeRef = useRef(0);
  const lastTickRef = useRef(Date.now());
  const savedRef = useRef(false);
  const visibleRef = useRef(!document.hidden);

  useEffect(() => {
    activeRef.current = 0;
    lastTickRef.current = Date.now();
    savedRef.current = false;
    visibleRef.current = !document.hidden;

    const onVisibility = () => {
      if (document.hidden) {
        activeRef.current += Date.now() - lastTickRef.current;
        visibleRef.current = false;
      } else {
        lastTickRef.current = Date.now();
        visibleRef.current = true;
      }
    };

    const sendTime = (minutes: number) => {
      const blob = new Blob(
        [JSON.stringify({ minutes })],
        { type: "application/json" }
      );
      navigator.sendBeacon("/api/study-time", blob);
    };

    const getActiveMinutes = () => {
      let total = activeRef.current;
      if (visibleRef.current) {
        total += Date.now() - lastTickRef.current;
      }
      return Math.floor(total / 60000);
    };

    const saveTime = () => {
      if (savedRef.current) return;
      const minutes = getActiveMinutes();
      if (minutes > 0) {
        savedRef.current = true;
        sendTime(minutes);
      }
    };

    window.addEventListener("beforeunload", saveTime);
    document.addEventListener("visibilitychange", onVisibility);

    const interval = setInterval(() => {
      const minutes = getActiveMinutes();
      if (minutes > 0) {
        fetch("/api/study-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minutes }),
        }).catch(() => {});
        activeRef.current = 0;
        lastTickRef.current = Date.now();
      }
    }, 300000);

    return () => {
      window.removeEventListener("beforeunload", saveTime);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
      saveTime();
    };
  }, []);
}
