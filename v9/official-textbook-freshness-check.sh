#!/usr/bin/env bash
set -euo pipefail

snapshot_url="https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data/official-monitor.json"
last_good_url="https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data/official-monitor-last-good.json"
snapshot="/tmp/official-monitor-textbook.json"
live="/tmp/official-monitor-textbook-live.json"
health="/tmp/official-monitor-textbook-live-health.json"
last_live_good="/tmp/official-monitor-textbook-live-last-good.json"
fallback="/tmp/official-monitor-textbook-last-good.json"
fresh_seconds=21600
fallback_seconds=86400

age_seconds(){
  local file="$1" generated epoch now
  generated="$(jq -r '.generatedAt // empty' "$file" 2>/dev/null || true)"
  epoch="$(date -u -d "$generated" +%s 2>/dev/null || echo 0)"
  now="$(date -u +%s)"
  if [[ "$epoch" -le 0 ]]; then echo 999999999; else echo $((now-epoch)); fi
}

if curl -fsSL --retry 3 --retry-delay 2 --retry-all-errors "$snapshot_url" -o "$snapshot"; then
  age="$(age_seconds "$snapshot")"
  if [[ "$age" -ge 0 && "$age" -le "$fresh_seconds" ]]; then
    node v9/official-textbook-change-gate.mjs --snapshot "$snapshot" --max-age-hours 6
    echo "OFFICIAL_TEXTBOOK_FRESHNESS_SUCCESS source=snapshot age_seconds=$age"
    exit 0
  fi
  echo "OFFICIAL_TEXTBOOK_SNAPSHOT_STALE age_seconds=$age"
else
  echo "OFFICIAL_TEXTBOOK_SNAPSHOT_UNAVAILABLE"
fi

node v9/official-monitor-sync.mjs \
  --output "$live" \
  --health-output "$health" \
  --last-good-output "$last_live_good"

material_ok="$(jq -r '.sourceStatus[]? | select(.id=="nfsa-materials") | .ok // false' "$live" | tail -1)"
material_error="$(jq -r '.sourceStatus[]? | select(.id=="nfsa-materials") | .errorCode // empty' "$live" | tail -1)"

if [[ "$material_ok" == "true" ]]; then
  node v9/official-textbook-change-gate.mjs --snapshot "$live" --max-age-hours 6
  echo "OFFICIAL_TEXTBOOK_FRESHNESS_SUCCESS source=live"
  exit 0
fi

if [[ "$material_error" != "WAF_CHALLENGE" ]]; then
  echo "OFFICIAL_TEXTBOOK_LIVE_SOURCE_UNHEALTHY error_code=$material_error"
  cat "$health" || true
  exit 2
fi

curl -fsSL --retry 3 --retry-delay 2 --retry-all-errors "$last_good_url" -o "$fallback"
fallback_age="$(age_seconds "$fallback")"
fallback_ok="$(jq -r '.sourceStatus[]? | select(.id=="nfsa-materials") | .ok // false' "$fallback" | tail -1)"
if [[ "$fallback_age" -lt 0 || "$fallback_age" -gt "$fallback_seconds" || "$fallback_ok" != "true" ]]; then
  echo "OFFICIAL_TEXTBOOK_WAF_LAST_GOOD_REJECTED age_seconds=$fallback_age source_ok=$fallback_ok"
  exit 3
fi

node v9/official-textbook-change-gate.mjs --snapshot "$fallback" --max-age-hours 24
echo "::warning::OFFICIAL_TEXTBOOK_WAF_LAST_GOOD_FALLBACK age_seconds=$fallback_age"
echo "OFFICIAL_TEXTBOOK_FRESHNESS_SUCCESS source=last-good-waf-fallback"
