import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 1000 * 60 * 60;

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word")?.trim().toLowerCase();
  if (!word || word.length < 2) {
    return NextResponse.json({ error: "Invalid word" }, { status: 400 });
  }

  const cached = cache.get(word);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data);
  }

  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const entries = await res.json();
  const entry = entries[0];

  const phonetic =
    entry.phonetic ||
    entry.phonetics?.find((p: { text?: string }) => p.text)?.text ||
    "";
  const audioUrl =
    entry.phonetics?.find(
      (p: { audio?: string }) => p.audio && p.audio.includes("us")
    )?.audio ||
    entry.phonetics?.find((p: { audio?: string }) => p.audio)?.audio ||
    "";

  const meanings = (
    entry.meanings as Array<{
      partOfSpeech: string;
      definitions: Array<{ definition: string; example?: string }>;
    }>
  )
    .slice(0, 3)
    .map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 2).map((d) => ({
        definition: d.definition,
        example: d.example || null,
      })),
    }));

  const data = { word: entry.word, phonetic, audioUrl, meanings };
  cache.set(word, { data, ts: Date.now() });

  return NextResponse.json(data);
}
