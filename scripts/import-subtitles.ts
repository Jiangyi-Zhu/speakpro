/**
 * SpeakPro Subtitle Import Tool
 *
 * Parses YouTube json3 subtitles (word-level timing) into sentence-level
 * segments and seeds them to the database.
 *
 * Usage:
 *   npx tsx scripts/import-subtitles.ts \
 *     --json3 public/videos/lesson1.en-orig.json3 \
 *     --lesson-id lesson-job-interview \
 *     [--translations translations.json] \
 *     [--pause-ms 800] \
 *     [--min-duration 4] \
 *     [--max-duration 20] \
 *     [--dry-run]
 *
 * The --translations file is a JSON array of { textZh: string } objects,
 * one per output segment (matched by index).
 */

import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── CLI args ────────────────────────────────────────────────────────────

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const json3Path = arg("json3");
const lessonId = arg("lesson-id");
const translationsPath = arg("translations");
const PAUSE_MS = Number(arg("pause-ms") ?? 800);
const MIN_DURATION = Number(arg("min-duration") ?? 4);
const MAX_DURATION = Number(arg("max-duration") ?? 20);
const DRY_RUN = flag("dry-run");

if (!json3Path || !lessonId) {
  console.error(
    "Usage: npx tsx scripts/import-subtitles.ts --json3 <path> --lesson-id <id> [options]"
  );
  process.exit(1);
}

// ── Types ───────────────────────────────────────────────────────────────

interface Word {
  text: string;
  startMs: number;
}

interface RawSegment {
  words: Word[];
  startMs: number;
  endMs: number;
  textEn: string;
}

// ── Parse json3 ─────────────────────────────────────────────────────────

function parseJson3(path: string): Word[] {
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const events: any[] = data.events || [];
  const words: Word[] = [];

  for (const event of events) {
    if (!event.segs) continue;
    const baseMs: number = event.tStartMs ?? 0;

    for (const seg of event.segs) {
      const text = (seg.utf8 ?? "").replace(/\n/g, " ").trim();
      if (!text) continue;
      const offsetMs: number = seg.tOffsetMs ?? 0;
      words.push({ text, startMs: baseMs + offsetMs });
    }
  }

  return words;
}

// ── Split into segments ─────────────────────────────────────────────────

function splitIntoSegments(words: Word[]): RawSegment[] {
  if (words.length === 0) return [];

  const segments: RawSegment[] = [];
  let current: Word[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    const word = words[i];
    const gap = word.startMs - prev.startMs;
    const segDuration = (word.startMs - current[0].startMs) / 1000;

    const isPause = gap >= PAUSE_MS;
    const tooLong = segDuration >= MAX_DURATION;
    const longEnough = segDuration >= MIN_DURATION;

    if ((isPause && longEnough) || tooLong) {
      segments.push(buildSegment(current, words[i]));
      current = [word];
    } else {
      current.push(word);
    }
  }

  if (current.length > 0) {
    const lastWord = current[current.length - 1];
    segments.push(buildSegment(current, undefined, lastWord.startMs + 2000));
  }

  return segments;
}

function buildSegment(
  words: Word[],
  nextWord?: Word,
  fallbackEndMs?: number
): RawSegment {
  const startMs = words[0].startMs;
  const endMs = nextWord ? nextWord.startMs : (fallbackEndMs ?? startMs + 3000);
  const textEn = words
    .map((w) => w.text)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { words, startMs, endMs, textEn };
}

// ── Capitalize first letter of sentences ────────────────────────────────

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Parsing: ${json3Path}`);
  const words = parseJson3(json3Path!);
  console.log(`Extracted ${words.length} words`);

  const segments = splitIntoSegments(words);
  console.log(`Split into ${segments.length} segments`);

  let translations: { textZh: string }[] = [];
  if (translationsPath) {
    translations = JSON.parse(readFileSync(translationsPath, "utf-8"));
    console.log(`Loaded ${translations.length} translations`);
  }

  console.log("\n--- Segments ---");
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const startSec = (seg.startMs / 1000).toFixed(1);
    const endSec = (seg.endMs / 1000).toFixed(1);
    const duration = ((seg.endMs - seg.startMs) / 1000).toFixed(1);
    const zh = translations[i]?.textZh || "";
    console.log(
      `[${i.toString().padStart(2)}] ${startSec}s - ${endSec}s (${duration}s) | ${capitalize(seg.textEn)}`
    );
    if (zh) console.log(`     zh: ${zh}`);
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: skipping database write");
    return;
  }

  console.log(`\nWriting to database (lesson: ${lessonId})...`);

  await prisma.lessonSegment.deleteMany({
    where: { lessonId: lessonId! },
  });

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    await prisma.lessonSegment.create({
      data: {
        lessonId: lessonId!,
        index: i,
        textEn: capitalize(seg.textEn),
        textZh: translations[i]?.textZh || null,
        startTime: seg.startMs / 1000,
        endTime: seg.endMs / 1000,
      },
    });
  }

  console.log(`Created ${segments.length} segments`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
