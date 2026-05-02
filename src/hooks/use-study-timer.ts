"use client";

import { useEffect, useRef } from "react";

export function useStudyTimer() {
  const startRef = useRef(Date.now());
  const savedRef = useRef(false);

  useEffect(() => {
    startRef.current = Date.now();
    savedRef.current = false;

    const saveTime = () => {
      if (savedRef.current) return;
      const elapsed = Math.floor((Date.now() - startRef.current) / 60000);
      if (elapsed > 0) {
        savedRef.current = true;
        const blob = new Blob(
          [JSON.stringify({ minutes: elapsed })],
          { type: "application/json" }
        );
        navigator.sendBeacon("/api/study-time", blob);
      }
    };

    window.addEventListener("beforeunload", saveTime);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 60000);
      if (elapsed > 0) {
        fetch("/api/study-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minutes: elapsed }),
        }).catch(() => {});
        startRef.current = Date.now();
      }
    }, 300000);

    return () => {
      window.removeEventListener("beforeunload", saveTime);
      clearInterval(interval);
      saveTime();
    };
  }, []);
}
