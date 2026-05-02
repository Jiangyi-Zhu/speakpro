export interface SubtitleEntry {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

function timeToSeconds(time: string): number {
  const parts = time.trim().replace(",", ".").split(":");
  if (parts.length === 3) {
    return (
      parseFloat(parts[0]) * 3600 +
      parseFloat(parts[1]) * 60 +
      parseFloat(parts[2])
    );
  }
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(parts[0]);
}

export function parseSRT(content: string): SubtitleEntry[] {
  const blocks = content.trim().split(/\n\s*\n/);
  const entries: SubtitleEntry[] = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const timeLine = lines[1];
    const match = timeLine.match(
      /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/
    );
    if (!match) continue;

    entries.push({
      index: entries.length,
      startTime: timeToSeconds(match[1]),
      endTime: timeToSeconds(match[2]),
      text: lines.slice(2).join(" ").trim(),
    });
  }

  return entries;
}

export function parseVTT(content: string): SubtitleEntry[] {
  let body = content;
  if (body.startsWith("WEBVTT")) {
    const idx = body.indexOf("\n\n");
    body = idx >= 0 ? body.slice(idx + 2) : body.replace(/^WEBVTT[^\n]*\n/, "");
  }

  const blocks = body.trim().split(/\n\s*\n/);
  const entries: SubtitleEntry[] = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");

    let timeLineIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timeLineIdx = i;
        break;
      }
    }

    const timeLine = lines[timeLineIdx];
    const match = timeLine?.match(
      /([\d:.]+)\s*-->\s*([\d:.]+)/
    );
    if (!match) continue;

    entries.push({
      index: entries.length,
      startTime: timeToSeconds(match[1]),
      endTime: timeToSeconds(match[2]),
      text: lines
        .slice(timeLineIdx + 1)
        .join(" ")
        .replace(/<[^>]+>/g, "")
        .trim(),
    });
  }

  return entries;
}

export function parseSubtitle(
  content: string,
  format?: "srt" | "vtt"
): SubtitleEntry[] {
  const detected =
    format || (content.trim().startsWith("WEBVTT") ? "vtt" : "srt");
  return detected === "vtt" ? parseVTT(content) : parseSRT(content);
}
