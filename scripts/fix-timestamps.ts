/**
 * Fix segment timestamps using json3 word-level timing data.
 *
 * Sequential matching: finds each segment's first words in the json3 word
 * stream, advancing forward only. Uses 4-5 word sequences for uniqueness.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/fix-timestamps.ts \
 *     --json3 public/videos/lesson1.en-orig.json3 \
 *     --lesson-id lesson-job-interview
 */

import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const json3Path = arg("json3") ?? "public/videos/lesson1.en-orig.json3";
const lessonId = arg("lesson-id") ?? "lesson-job-interview";

interface Word {
  text: string;
  startMs: number;
}

function parseJson3(path: string): Word[] {
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const words: Word[] = [];
  for (const event of data.events || []) {
    if (!event.segs) continue;
    const baseMs: number = event.tStartMs ?? 0;
    for (const seg of event.segs) {
      const text = (seg.utf8 ?? "").replace(/\n/g, " ").trim();
      if (!text) continue;
      words.push({
        text: text.toLowerCase().replace(/[^a-z'-]/g, ""),
        startMs: baseMs + (seg.tOffsetMs ?? 0),
      });
    }
  }
  return words.filter((w) => w.text.length > 0);
}

function cleanWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z'-]/g, "");
}

function findSequenceAfter(
  words: Word[],
  targets: string[],
  afterIdx: number
): number | null {
  const searchFrom = Math.max(0, afterIdx);
  for (let i = searchFrom; i <= words.length - targets.length; i++) {
    let match = true;
    for (let j = 0; j < targets.length; j++) {
      if (words[i + j].text !== targets[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  // Retry with fewer words (3 then 2)
  for (let len = Math.min(3, targets.length); len >= 2; len--) {
    const shorter = targets.slice(0, len);
    for (let i = searchFrom; i <= words.length - shorter.length; i++) {
      let match = true;
      for (let j = 0; j < shorter.length; j++) {
        if (words[i + j].text !== shorter[j]) {
          match = false;
          break;
        }
      }
      if (match) return i;
    }
  }
  return null;
}

async function main() {
  const allWords = parseJson3(json3Path);
  console.log(`Parsed ${allWords.length} words from json3`);

  const segments = await prisma.lessonSegment.findMany({
    where: { lessonId },
    orderBy: { index: "asc" },
  });
  console.log(`Found ${segments.length} segments in DB\n`);

  let searchFrom = 0;
  const matchedStarts: { idx: number; ms: number }[] = [];

  for (const seg of segments) {
    const textWords = seg.textEn
      .split(/\s+/)
      .map(cleanWord)
      .filter((w) => w.length > 0);

    const searchWords = textWords.slice(0, Math.min(5, textWords.length));
    const matchIdx = findSequenceAfter(allWords, searchWords, searchFrom);

    if (matchIdx !== null) {
      const preciseMs = allWords[matchIdx].startMs;
      const oldMs = (seg.startTime ?? 0) * 1000;
      const diff = preciseMs - oldMs;
      matchedStarts.push({ idx: seg.index, ms: preciseMs });
      console.log(
        `[${seg.index.toString().padStart(2)}] ${(oldMs / 1000).toFixed(1).padStart(6)}s → ${(preciseMs / 1000).toFixed(2).padStart(7)}s (${diff > 0 ? "+" : ""}${(diff / 1000).toFixed(2).padStart(6)}s) | ${searchWords.join(" ")}`
      );
      searchFrom = matchIdx + 1;
    } else {
      const fallbackMs = (seg.startTime ?? 0) * 1000;
      matchedStarts.push({ idx: seg.index, ms: fallbackMs });
      console.log(
        `[${seg.index.toString().padStart(2)}] ${(fallbackMs / 1000).toFixed(1).padStart(6)}s → NO MATCH | ${searchWords.join(" ")}`
      );
    }
  }

  const matched = matchedStarts.filter(
    (_, i) =>
      segments[i].startTime !== null &&
      Math.abs(matchedStarts[i].ms - segments[i].startTime! * 1000) > 10
  ).length;
  const noMatch = matchedStarts.filter(
    (m, i) =>
      segments[i].startTime !== null &&
      Math.abs(m.ms - segments[i].startTime! * 1000) <= 10
  ).length;

  console.log(
    `\nMatched: ${segments.length - noMatch}/${segments.length} (${noMatch} unchanged)`
  );

  console.log("Updating database...");
  for (let i = 0; i < segments.length; i++) {
    const startTime = matchedStarts[i].ms / 1000;
    const endTime =
      i < segments.length - 1
        ? matchedStarts[i + 1].ms / 1000
        : startTime + 5;

    await prisma.lessonSegment.update({
      where: { id: segments[i].id },
      data: { startTime, endTime },
    });
  }

  console.log(`Updated ${segments.length} segments`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
