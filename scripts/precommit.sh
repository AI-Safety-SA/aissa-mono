#!/usr/bin/env bash

set -euo pipefail

STAGED_FILES=()
while IFS= read -r -d '' file; do
  STAGED_FILES+=("$file")
done < <(git diff --cached --name-only --diff-filter=ACMRD -z)

if [[ ${#STAGED_FILES[@]} -eq 0 ]]; then
  echo "No staged tracked files. Skipping pre-commit checks."
  exit 0
fi

run_all=false
run_track_record=false
run_legacy_website=false
run_public_website=false
non_markdown_files=0

for file in "${STAGED_FILES[@]}"; do
  [[ -z "$file" ]] && continue
  lower_file="$(printf '%s' "$file" | tr '[:upper:]' '[:lower:]')"

  if [[ "$lower_file" == *.md ]]; then
    continue
  fi

  non_markdown_files=$((non_markdown_files + 1))

  case "$file" in
    apps/track-record/*)
      run_track_record=true
      ;;
    apps/legacy-website/*)
      run_legacy_website=true
      ;;
    apps/public-website/*)
      run_public_website=true
      ;;
    *)
      run_all=true
      ;;
  esac
done

if [[ $non_markdown_files -eq 0 ]]; then
  echo "Staged changes are markdown-only. Skipping pre-commit checks."
  exit 0
fi

if [[ "$run_all" == true ]]; then
  run_track_record=true
  run_legacy_website=true
  run_public_website=true
fi

if [[ "$run_track_record" == true ]]; then
  echo "Running track-record pre-commit checks..."
  pnpm turbo run check-types --filter=track-record...
  pnpm turbo run lint --filter=track-record...
  pnpm --filter track-record run test:unit
fi

if [[ "$run_legacy_website" == true ]]; then
  echo "Running legacy-website pre-commit checks..."
  pnpm turbo run check-types --filter=legacy-website...
  pnpm turbo run lint --filter=legacy-website...
fi

if [[ "$run_public_website" == true ]]; then
  echo "Running public-website pre-commit checks..."
  pnpm turbo run check-types --filter=public-website...
  pnpm --filter public-website run test:unit
fi
