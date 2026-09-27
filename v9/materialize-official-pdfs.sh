#!/usr/bin/env bash
set -euo pipefail

out_dir="${1:-official-pdf-mirror}"
shift || true
if [[ "$#" -gt 0 ]]; then
  docs=("$@")
else
  docs=(fire1 fire2 ems prevention1 prevention2 law1 law2 law3 law4 law5)
fi

mkdir -p "$out_dir"
for doc in "${docs[@]}"; do
  out="$out_dir/$doc.pdf"
  if [[ -s "$out" ]] && [[ "$(head -c 5 "$out" 2>/dev/null || true)" == "%PDF-" ]]; then
    echo "OFFICIAL_PDF_MATERIALIZE_CACHE_HIT doc=$doc bytes=$(wc -c < "$out" | tr -d ' ')"
    continue
  fi
  meta="$(mktemp)"
  tmp="${out}.tmp"
  rm -f "$tmp"
  node v9/official-pdf-materialize-resolve.mjs "$doc" "$meta"
  referer="$(jq -r '.detailUrl' "$meta")"
  cookie="$(jq -r '.cookie' "$meta")"
  ok=0
  while IFS= read -r url; do
    rm -f "$tmp"
    args=(-fsSL --retry 4 --retry-delay 2 --retry-all-errors --connect-timeout 20 --max-time 240
      -A 'Mozilla/5.0 (compatible; 119Study/1.0)'
      -H 'Accept: application/pdf,*/*;q=0.8'
      -H 'Cache-Control: no-cache'
      -e "$referer")
    if [[ -n "$cookie" ]]; then args+=(-H "Cookie: $cookie"); fi
    if curl "${args[@]}" "$url" -o "$tmp"; then
      magic="$(head -c 5 "$tmp" 2>/dev/null || true)"
      bytes="$(wc -c < "$tmp" | tr -d ' ')"
      if [[ "$magic" == "%PDF-" && "$bytes" -gt 100000 ]]; then
        mv "$tmp" "$out"
        ok=1
        break
      fi
    fi
    rm -f "$tmp"
  done < <(jq -r '.urls[]' "$meta")
  rm -f "$meta"
  test "$ok" = "1"
  bytes="$(wc -c < "$out" | tr -d ' ')"
  sha="$(sha256sum "$out" | awk '{print $1}')"
  echo "OFFICIAL_PDF_MATERIALIZE_SUCCESS doc=$doc bytes=$bytes sha256=$sha"
done
