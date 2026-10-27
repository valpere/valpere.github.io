#!/bin/bash
# valpere.github.io project dreaming pass.
#
# Purpose: scheduled (weekly) curation of THIS project only — read-only,
# outputs a report. Scoped to valpere.github.io alone (never cross-mines other
# projects).
#
# Schedule: systemd user timer (Sun, spread after the other dreaming
# timers — see ~/wrk/common/dreaming/HOW-TO-APPLY.md; Persistent=true
# catches up at next login if the machine was off).

set -euo pipefail

# Ensure claude/gh/jq are reachable when invoked from a minimal systemd env
export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Route claude-code through Ollama (localhost:11434, Device Key auth).
# Avoids Anthropic weekly limits — see ~/wrk/common/dreaming/dreaming.sh
# for the rationale and env-vars justification.
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"  # .claude/dreaming -> project root
REPORTS_DIR="$SCRIPT_DIR/reports"
PROMPT_FILE="$SCRIPT_DIR/dreaming-prompt.md"
WEEK="$(date +%Y-W%V)"
REPORT="$REPORTS_DIR/$WEEK.md"
LOG="$REPORTS_DIR/.dreaming.log"
mkdir -p "$REPORTS_DIR"

# Write to a hidden temp file and mv on success: `> "$REPORT"` would create an
# empty report before the agent starts (it sees its own 0-byte stub) and a
# failed run would clobber an existing report for the week.
TMP_REPORT="$(mktemp "$REPORTS_DIR/.$WEEK.XXXXXX.tmp")"
trap 'rm -f "$TMP_REPORT"' EXIT


if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "[dreaming] missing prompt file: $PROMPT_FILE" >&2
  exit 1
fi

if [[ ! -d "$PROJECT_DIR/.git" ]]; then
  echo "[dreaming] not a git repo: $PROJECT_DIR" >&2
  exit 1
fi

# Change gate: an agentic pass is hundreds of Ollama requests (2026-10-25: all
# weekly passes together exhausted the 5-hour limit). Skip when neither commits
# nor memory/CLAUDE.md changed since the newest report. DREAMING_FORCE=1 overrides.
# (lib-gate.sh is a copy of ~/wrk/common_claude/dreaming/lib-gate.sh without
# dreaming_allowed_memdirs, which needs the canonical hook-common.sh.)
source "$SCRIPT_DIR/lib-gate.sh"
SLUG="$(printf '%s' "$PROJECT_DIR" | sed 's#[^A-Za-z0-9]#-#g')"   # ~/.claude/projects/<slug>
if [[ "${DREAMING_FORCE:-0}" != "1" ]] \
   && ! dreaming_repo_changed_since "$REPORTS_DIR" "$PROJECT_DIR" \
   && ! dreaming_changed_since "$REPORTS_DIR" "$HOME/.claude/projects/$SLUG/memory" "$PROJECT_DIR/CLAUDE.md" "$PROJECT_DIR/AGENTS.md"; then
  echo "[$(date -Iseconds)] dreaming skipped: no commits/memory change since last report" >> "$LOG"
  echo "[dreaming] skipped: nothing changed since the last report (DREAMING_FORCE=1 to run anyway)"
  exit 0
fi

echo "[$(date -Iseconds)] valpere.github.io dreaming pass started" >> "$LOG"

cd "$PROJECT_DIR"

PROMPT="$(cat "$PROMPT_FILE")
Today is $(date -I).
Current branch: $(git rev-parse --abbrev-ref HEAD).
Project root: $PROJECT_DIR.
Write the report to stdout."

# `if` guards the pipeline so `set -e` doesn't abort the script right
# here on a non-zero claude exit — a bare `cmd; EXIT=$?` line under
# errexit never reaches the EXIT=$? assignment; the whole error-handling
# block below it becomes dead code exactly when it's needed.
if echo "$PROMPT" | claude \
  --print \
  --model minimax-m3:cloud \
  --fallback-model kimi-k2.7-code:cloud \
  --strict-mcp-config \
  --allowed-tools "Read,Glob,Grep,Bash(ls:*),Bash(cat:*),Bash(wc:*),Bash(stat:*),Bash(find:*),Bash(git log:*),Bash(git diff:*),Bash(git show:*),Bash(git rev-parse:*),Bash(gh pr list:*),Bash(gh pr view:*),Bash(gh issue list:*),Bash(awk:*),Bash(sort:*),Bash(uniq:*)" \
  > "$TMP_REPORT" 2>> "$LOG"; then
  EXIT=0
else
  EXIT=$?
fi
echo "[$(date -Iseconds)] valpere.github.io dreaming finished (exit=$EXIT, report=$REPORT)" >> "$LOG"

if [[ $EXIT -ne 0 ]]; then
  echo "[dreaming] non-zero exit; check $LOG" >&2
  exit "$EXIT"
fi

# Publish only a real report: a failed run (e.g. 429 "usage limit" left a
# 238-byte error text as 2026-W43.md on 2026-10-25) must not look like a
# report — the gate and /apply-dreaming treat the newest *.md as the last one.
SIZE=$(wc -c < "$TMP_REPORT")
if [[ "$SIZE" -lt 500 || "$(head -c 9 "$TMP_REPORT")" == "API Error" ]]; then
  FAILED="$REPORTS_DIR/.failed-$WEEK.txt"
  mv -f "$TMP_REPORT" "$FAILED"
  echo "[$(date -Iseconds)] dreaming FAILED ($SIZE bytes) — output kept in $FAILED" >> "$LOG"
  echo "[dreaming] failed ($SIZE bytes); no report published; output in $FAILED, log $LOG" >&2
  exit 1
fi
mv "$TMP_REPORT" "$REPORT"

echo "[dreaming] OK: $REPORT ($SIZE bytes)"
