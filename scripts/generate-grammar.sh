#!/bin/bash
# Generate grammar notes for lesson segments using Claude CLI
# Usage: ./scripts/generate-grammar.sh <API_BASE_URL> <LESSON_ID>
# Example: ./scripts/generate-grammar.sh https://speakpro.vercel.app cm...lessonid

set -e

API_BASE="${1:?Usage: $0 <API_BASE_URL> <LESSON_ID>}"
LESSON_ID="${2:?Usage: $0 <API_BASE_URL> <LESSON_ID>}"

echo "Fetching segments for lesson: $LESSON_ID"
SEGMENTS=$(curl -s "${API_BASE}/api/lessons/${LESSON_ID}/segments")

COUNT=$(echo "$SEGMENTS" | jq length)
echo "Found $COUNT segments"

for i in $(seq 0 $((COUNT - 1))); do
  SEG_ID=$(echo "$SEGMENTS" | jq -r ".[$i].id")
  TEXT_EN=$(echo "$SEGMENTS" | jq -r ".[$i].textEn")
  EXISTING=$(echo "$SEGMENTS" | jq -r ".[$i].grammarNote // empty")

  if [ -n "$EXISTING" ]; then
    echo "[$((i+1))/$COUNT] Skipping (already has grammar): $SEG_ID"
    continue
  fi

  echo "[$((i+1))/$COUNT] Generating grammar for: ${TEXT_EN:0:60}..."

  GRAMMAR=$(echo "请为以下英语句子写一段简短的语法解析（中文），重点讲解：1）句型结构 2）关键语法点 3）职场用法提示。控制在2-3句话以内，不要用markdown格式。

句子：${TEXT_EN}" | claude -p 2>/dev/null)

  if [ -z "$GRAMMAR" ]; then
    echo "  Failed to generate, skipping"
    continue
  fi

  # Update via API
  curl -s -X PATCH "${API_BASE}/api/lessons/${LESSON_ID}/segments" \
    -H "Content-Type: application/json" \
    -d "{\"id\": \"$SEG_ID\", \"grammarNote\": $(echo "$GRAMMAR" | jq -Rs .)}" > /dev/null

  echo "  Done"
done

echo "Grammar generation complete!"
