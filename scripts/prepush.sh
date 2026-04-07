#!/usr/bin/env bash

set -euo pipefail

resolve_base_ref() {
  if upstream_ref="$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null)"; then
    printf '%s\n' "$upstream_ref"
    return
  fi

  if git show-ref --verify --quiet refs/remotes/origin/main; then
    git merge-base HEAD origin/main
    return
  fi

  if git show-ref --verify --quiet refs/heads/main; then
    git merge-base HEAD main
    return
  fi

  printf 'HEAD~1\n'
}

BASE_REF="$(resolve_base_ref)"
CHANGED_FILES=()

while IFS= read -r -d '' file; do
  CHANGED_FILES+=("$file")
done < <(git diff --name-only --diff-filter=ACMRD -z "$BASE_REF"...HEAD)

if [[ ${#CHANGED_FILES[@]} -eq 0 ]]; then
  echo "No committed changes to push. Skipping pre-push checks."
  exit 0
fi

run_all=false
run_track_record=false
run_website=false
non_markdown_files=0

for file in "${CHANGED_FILES[@]}"; do
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
    apps/website/*)
      run_website=true
      ;;
    *)
      run_all=true
      ;;
  esac
done

if [[ $non_markdown_files -eq 0 ]]; then
  echo "Committed changes are markdown-only. Skipping pre-push checks."
  exit 0
fi

if [[ "$run_all" == true ]]; then
  run_track_record=true
  run_website=true
fi

if [[ "$run_track_record" == true ]]; then
  echo "Running track-record pre-push build..."
  pnpm --filter track-record run build:local
fi

if [[ "$run_website" == true ]]; then
  echo "Running website pre-push build..."
  pnpm turbo run build --filter=website...
fi
