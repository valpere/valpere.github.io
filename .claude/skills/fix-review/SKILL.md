---
name: fix-review
description: Multi-model PR review with parallel fan-out. Three Ollama Cloud models review the full PR diff in parallel; Claude acts as Arbiter using vote count as a confidence prior to confirm/escalate/dismiss findings, then applies a single consolidated fix commit. Auto-merges (squash) when clean. Usage: /fix-review [PR-number]
---

# Skill: /fix-review (parallel) — valpere.github.io

---

## OVERVIEW

Three model rounds run **in parallel**, then a single Claude arbiter
round adjudicates and applies the consolidated fix.

```
        ┌─→ Round 1 (model A)  ┐
diff ───┼─→ Round 2 (model B)  ┼─→ aggregate (dedupe + vote count)
        └─→ Round 3 (model C)  ┘
                                    ↓
                              Arbiter (Claude) — rules + ONE fix → commit → push
```

Only provider: **Ollama** (Cloud by default — `:cloud` models, free tier — or local via `reviewer_set: local` in `config.yaml`).

**Merge:** auto-merge (squash + delete branch) when the run is clean. "Clean" means no fixes were reverted, the PR has no merge conflicts, and `bundle exec jekyll build` passes. If anything blocks merge, the skill asks the user once before acting.

---

## RUN COMPLETION CONTRACT (do not skip)

The canonical step order is **Step 9 (Telemetry) → Step 10 (Merge) → Step 11 (Summary)**. A run is not complete until **both** of these have run:

1. **Step 9 telemetry** — `telemetry.jsonl` appended.
2. **Step 11 final summary** — printed to the user.

Step 10 (auto-merge) is **not** the end of the run. Whatever Step 10 returns — `merged`, `merged (forced)`, `left open`, or `closed` — control MUST flow into Step 11.

---

## STEP 0: Resolve PR + Load Config

```bash
PR_NUMBER="${1:-$(gh pr view --json number --jq '.number' 2>/dev/null)}"
[ -z "$PR_NUMBER" ] && { echo "No open PR. Pass /fix-review <number>"; exit 1; }

gh pr view "$PR_NUMBER" --json number,title,headRefName,baseRefName,url
BASE_BRANCH=$(gh pr view "$PR_NUMBER" --json baseRefName --jq '.baseRefName')
```

**Load `config.yaml`** from `.claude/skills/fix-review/config.yaml`. Extract:
- `reviewer_set` (`cloud` → `reviewers.ollama_cloud`, `local` → `reviewers.ollama_local`)
- `reviewers.{ollama_cloud|ollama_local}.round_{1,2,3}.model`
- `ollama_api_url` / `ollama_api_url_local`
- `post_summary_to_pr`
- `telemetry_enabled`, `telemetry_file`

```bash
source .claude/skills/lib/env.sh
source .claude/skills/lib/rest.sh

REVIEWER_SET=$(grep '^reviewer_set:' .claude/skills/fix-review/config.yaml | awk '{print $2}')
REVIEWER_SET="${REVIEWER_SET:-cloud}"

if [ "$REVIEWER_SET" = "cloud" ]; then
  REVIEWER_BLOCK=ollama_cloud
  # OLLAMA_API_KEY is optional — local Ollama daemon uses device key auth.
  load_env_key OLLAMA_API_KEY 2>/dev/null || true
  API_KEY="${OLLAMA_API_KEY:-}"
  API_URL=$(grep '^ollama_api_url:' .claude/skills/fix-review/config.yaml | awk '{print $2}')
else
  REVIEWER_BLOCK=ollama_local
  API_KEY=""
  API_URL=$(grep '^ollama_api_url_local:' .claude/skills/fix-review/config.yaml | awk '{print $2}')
fi

MODEL_R1=$(yq -r ".reviewers.${REVIEWER_BLOCK}.round_1.model // \"\"" .claude/skills/fix-review/config.yaml)
MODEL_R2=$(yq -r ".reviewers.${REVIEWER_BLOCK}.round_2.model // \"\"" .claude/skills/fix-review/config.yaml)
MODEL_R3=$(yq -r ".reviewers.${REVIEWER_BLOCK}.round_3.model // \"\"" .claude/skills/fix-review/config.yaml)
```

**Probe Ollama Cloud + CLI failover** (same pattern as lance-agent SKILL.md Step 0):

```bash
ACTIVE_PROVIDER=ollama
CLI_AGENTS=()
FAILOVER_TIER=""
FAILOVER_REASON=""

probe_provider() {
  local payload resp http err
  payload=$(jq -n --arg m "$MODEL_R1" \
    '{model:$m,messages:[{role:"user",content:"OK"}],stream:false,max_tokens:3}')
  resp=$(curl -s --max-time 10 -w '\n%{http_code}' \
    -H "Content-Type: application/json" \
    ${API_KEY:+-H "Authorization: Bearer $API_KEY"} \
    -d "$payload" "$API_URL")
  http="${resp##*$'\n'}"; resp="${resp%$'\n'*}"
  if [ "$http" -lt 200 ] || [ "$http" -ge 300 ]; then
    err=$(printf '%s' "$resp" | jq -r '
      if type == "object" then
        (.error | if type == "string" then . elif type == "object" then .message // tostring else tostring end)
      else . end // ""
    ' 2>/dev/null)
    FAILOVER_REASON="HTTP ${http}${err:+: ${err}}"
    return 1
  fi
  return 0
}

if [ "$REVIEWER_SET" = "cloud" ] && ! probe_provider; then
  echo "⚠️  FAILOVER: Ollama Cloud unavailable (${FAILOVER_REASON}) — engaging CLI tier" >&2
  count=$(yq '.reviewers.cli | length' .claude/skills/fix-review/config.yaml 2>/dev/null)
  for ((i=0; i<count; i++)); do
    name=$(yq -r ".reviewers.cli[$i].name" .claude/skills/fix-review/config.yaml)
    cmd=$(yq -r  ".reviewers.cli[$i].cmd"  .claude/skills/fix-review/config.yaml)
    CLI_AGENTS+=("${name}|${cmd}")
  done
  [ "${#CLI_AGENTS[@]}" -eq 0 ] && { echo "✗ CLI tier empty. Aborting." >&2; exit 1; }
  ACTIVE_PROVIDER=cli
  FAILOVER_TIER=cli
fi
```

**Telemetry helpers:**
```bash
TELEMETRY_ENABLED=$(grep '^telemetry_enabled:' .claude/skills/fix-review/config.yaml | awk '{print $2}')
TELEMETRY_FILE=$(grep '^telemetry_file:'     .claude/skills/fix-review/config.yaml | awk '{print $2}')
TELEMETRY_ENABLED="${TELEMETRY_ENABLED:-true}"
TELEMETRY_FILE="${TELEMETRY_FILE:-.claude/skills/fix-review/telemetry.jsonl}"

now_ms() {
  python3 -c "import time;print(int(time.time()*1000))" 2>/dev/null \
    || date +%s%3N 2>/dev/null \
    || echo $(($(date +%s) * 1000))
}
```

---

## STEP 1: Build the Review Prompt

```bash
DIFF=$(git diff -U10 $(git merge-base HEAD origin/${BASE_BRANCH})...HEAD)
```

### Detect diff type

Almost all PRs in this repo touch only Markdown, YAML, SVG, or images — detect as docs-only and use the docs-specific prompt.

```bash
is_docs_only_diff() {
  local files
  files=$(git diff --name-only "$(git merge-base HEAD origin/${BASE_BRANCH})...HEAD")
  [ -z "$files" ] && return 1
  while IFS= read -r f; do
    case "$f" in
      *.md|*.markdown)                            ;;
      *.yaml|*.yml|*.toml)                        ;;
      *.svg|*.png|*.jpg|*.jpeg|*.gif|*.webp)      ;;
      assets/*|projects/assets/*|portfolio/assets/*) ;;
      CLAUDE.md|README*|CHANGELOG*)               ;;
      .gitignore|.editorconfig)                   ;;
      *)                                          return 1 ;;
    esac
  done <<< "$files"
  return 0
}

DIFF_TYPE=code
if is_docs_only_diff; then
  DIFF_TYPE=docs
  echo "→ Documentation/content diff — using docs-prompt.txt"
fi
```

**Load prompt:**

```bash
if [ "$DIFF_TYPE" = "docs" ]; then
  DOCS_PROMPT_FILE=".claude/skills/fix-review/docs-prompt.txt"
  if [ -f "$DOCS_PROMPT_FILE" ]; then
    PROJECT_CONTEXT=$(head -150 CLAUDE.md 2>/dev/null || echo "")
    PROMPT_TEMPLATE=$(cat "$DOCS_PROMPT_FILE")
    PROMPT_TEMPLATE=$(printf '%s' "$PROMPT_TEMPLATE" | sed "s|{PROJECT_CONTEXT}|$(printf '%s' "$PROJECT_CONTEXT" | sed 's/[\\/&]/\\&/g; s/$/\\n/' | tr -d '\n')|")
  else
    DIFF_TYPE=code
  fi
fi

if [ "$DIFF_TYPE" = "code" ]; then
  PROMPT_TEMPLATE="You are a senior Jekyll/web engineer reviewing a pull request on valpere.github.io (Jekyll + Minima + GitHub Pages).

Review the following git diff. Flag:
- Missing required frontmatter fields (layout, title, date, permalink, lang)
- Broken markdown or Liquid syntax
- og:image/image: frontmatter value that is a hash instead of a plain string (jekyll-seo-tag 2.8.0 breaks on hash)
- Wrong date: format (must be YYYY-MM-DD)
- SCSS syntax errors
- Hardcoded absolute URLs that should be site-relative

Return ONLY a JSON array. Each item: {\"file\": str, \"line\": int, \"layer\": int 1-4, \"severity\": \"error\"|\"warning\"|\"suggestion\", \"body\": str}
If no issues: []

Git diff:
---
{DIFF}
---"
fi

PROMPT=$(printf '%s' "$PROMPT_TEMPLATE" | sed "s|{DIFF}|$(printf '%s' "$DIFF" | sed 's/[\\/&]/\\&/g')|")
```

---

## STEP 2: Fan Out — Three Models in Parallel

```bash
RUN_DIR=$(mktemp -d -t fix-review-XXXX)
WALL_START_MS=$(now_ms)

REVIEW_SYSTEM_MSG="You are a senior code reviewer. Your entire response MUST be a raw JSON array — nothing else. Start with [ and end with ]. No prose, no markdown fences, no explanations before or after. If there are no issues output exactly: []"

export PROVIDER REVIEWER_BLOCK API_URL API_KEY PROMPT RUN_DIR \
       MODEL_R1 MODEL_R2 MODEL_R3 REVIEW_SYSTEM_MSG
export -f rest_post now_ms 2>/dev/null

run_round() {
  local n="$1" model="$2"
  local r_start r_end payload response think pt ct
  r_start=$(now_ms)
  think=$(yq -r ".reviewers.${REVIEWER_BLOCK}.round_${n}.think // true" \
    .claude/skills/fix-review/config.yaml 2>/dev/null)
  payload=$(jq -n --arg m "$model" --arg sys "$REVIEW_SYSTEM_MSG" \
    --arg user "$PROMPT" --argjson think "$think" \
    '{model:$m,messages:[{role:"system",content:$sys},{role:"user",content:$user}],stream:false,think:$think}')
  response=$(rest_post "$API_URL" "$payload" "$API_KEY") \
    || response='{"_error":"rest_post_failed"}'
  r_end=$(now_ms)
  printf '%s' "$response" > "$RUN_DIR/round_${n}.raw.json"
  pt=$(printf '%s' "$response" | jq -r '.prompt_eval_count // empty')
  ct=$(printf '%s' "$response" | jq -r '.eval_count // empty')
  printf '%s\n%s\n%s %s\n' "$model" "$((r_end - r_start))" \
    "${pt:-null}" "${ct:-null}" > "$RUN_DIR/round_${n}.meta"
}

run_cli_round() {
  local n="$1" name="$2" cmd="$3"
  local r_start r_end response
  r_start=$(now_ms)
  response=$(printf '%s' "$PROMPT" | timeout 300 sh -c "$cmd" 2>/dev/null) || response=""
  r_end=$(now_ms)
  printf '%s' "$response" > "$RUN_DIR/round_${n}.raw.txt"
  printf '%s\n%s\nnull null\n' "$name" "$((r_end - r_start))" > "$RUN_DIR/round_${n}.meta"
}
export -f run_round run_cli_round

if [ "$ACTIVE_PROVIDER" = "cli" ]; then
  n=1
  for entry in "${CLI_AGENTS[@]}"; do
    name="${entry%%|*}"; cmd="${entry#*|}"
    run_cli_round "$n" "$name" "$cmd" &
    n=$((n + 1))
  done
  wait
  NUM_ROUNDS=$((n - 1))
else
  run_round 1 "$MODEL_R1" &
  run_round 2 "$MODEL_R2" &
  run_round 3 "$MODEL_R3" &
  wait
  NUM_ROUNDS=3
fi

WALL_END_MS=$(now_ms)
WALL_TIME_MS=$((WALL_END_MS - WALL_START_MS))
```

---

## STEP 3: Parse Each Response → Tagged Findings

```bash
parse_round() {
  local n="$1"
  local model content
  model=$(head -1 "$RUN_DIR/round_${n}.meta")
  if [ "$ACTIVE_PROVIDER" = "cli" ]; then
    content=$(cat "$RUN_DIR/round_${n}.raw.txt")
  else
    content=$(jq -r '.message.content // empty' "$RUN_DIR/round_${n}.raw.json")
  fi
  content=$(printf '%s' "$content" | sed -E 's/^```(json)?[[:space:]]*//; s/```[[:space:]]*$//')
  if ! echo "$content" | jq -e 'type == "array"' >/dev/null 2>&1; then
    echo "warn: round ${n} (${model}) returned non-array — 0 findings" >&2
    echo "[]" > "$RUN_DIR/round_${n}.findings.json"
    return
  fi
  echo "$content" | jq --arg m "$model" 'map(. + {model: $m})' \
    > "$RUN_DIR/round_${n}.findings.json"
}
for n in $(seq 1 "$NUM_ROUNDS"); do parse_round "$n"; done
```

---

## STEP 4: Aggregate — Dedupe + Vote Count

```bash
jq -s '
  flatten
  | group_by(.file + ":" + (.line|tostring))
  | map({
      file:     .[0].file,
      line:     .[0].line,
      votes:    length,
      models:   [.[] | .model],
      body:     ([.[] | .body] | sort_by(length) | last),
      severity: ([.[] | .severity] | unique
                  | (if any(. == "error") then "error"
                     elif any(. == "warning") then "warning"
                     else "suggestion" end)),
      layer:    ([.[] | .layer] | min)
    })
  | sort_by(.layer, (if .severity == "error" then 0 elif .severity == "warning" then 1 else 2 end), -.votes)
' "$RUN_DIR"/round_*.findings.json > "$RUN_DIR/aggregated.json"

TOTAL_FINDINGS=$(jq 'length' "$RUN_DIR/aggregated.json")
declare -A VOTE_BAND
for v in $(seq 1 "$NUM_ROUNDS"); do
  VOTE_BAND[$v]=$(jq --argjson v "$v" '[.[] | select(.votes == $v)] | length' "$RUN_DIR/aggregated.json")
done
TOP_VOTE_COUNT="${VOTE_BAND[$NUM_ROUNDS]:-0}"
```

---

## STEP 5: Arbiter (Claude)

Read `$RUN_DIR/aggregated.json`. For each finding, rule:

| Ruling | When |
|---|---|
| **CONFIRM** | Real issue. Default for `votes ≥ 2`. |
| **ESCALATE** | Real issue, more severe than tagged. |
| **DISMISS** | False positive or conflicts with project conventions. Default for `votes == 1` unless clearly real. |
| **DEFER** | Real but out of scope for this PR. Log, don't fix. |

**Independent scan** of the full diff — flag anything all three models missed:
- `og:image:` / `image:` frontmatter value is a hash instead of a string path (known jekyll-seo-tag 2.8.0 breakage)
- Hardcoded `https://valpere.github.io/` URLs in post body (should be site-relative `/...`)
- Bilingual pair: EN post added without `-uk.md` counterpart or vice versa
- Required frontmatter fields missing: `layout`, `title`, `date`, `permalink`, `lang`
- `permalink:` does not follow `/blog/YYYY/MM/DD/<slug>/` pattern
- Image filename in assets does not match convention `<desc>-<seq>-<WxH>.<ext>` (SVG exempted from dimensions)
- Image referenced in post not present in this diff's added files

**Apply CONFIRM + ESCALATE fixes** via the Edit tool. Minimal change per fix.

Save arbiter's rulings to `$RUN_DIR/arbiter.json`:
```jsonc
[{"file":"...", "line":42, "ruling":"CONFIRM", "votes":3, "body":"..."}]
```

---

## STEP 6: Run Quality Gate

```bash
bundle exec jekyll build 2>&1 | tail -20
GATE_EXIT=$?
```

### Diff-scope check before reverting

Before reverting a fix:
1. Check what files this PR touches.
2. A `bundle exec jekyll build` failure from a Markdown/YAML change is in-scope; a SCSS deprecation warning from Minima theme is pre-existing (not in diff).
3. Pre-existing failures: log as `Pre-existing failure — not introduced by this PR. Continuing.` Do not revert.

```bash
GATES_OK=no
if [ $GATE_EXIT -eq 0 ]; then
  GATES_OK=yes
fi
```

---

## STEP 6a: Compute Aggregates Before Output

```bash
SEQ_SUM_MS=0
for n in $(seq 1 "$NUM_ROUNDS"); do
  meta="$RUN_DIR/round_${n}.meta"
  [ -f "$meta" ] || continue
  d=$(sed -n '2p' "$meta")
  SEQ_SUM_MS=$((SEQ_SUM_MS + ${d:-0}))
done
SPEEDUP=$(awk -v s="$SEQ_SUM_MS" -v w="$WALL_TIME_MS" \
  'BEGIN{ if (w>0) printf "%.2f", s/w; else print "n/a" }')

if [ "$ACTIVE_PROVIDER" = "cli" ]; then
  MODELS_LIST=$(printf '%s | ' "${CLI_AGENTS[@]%%|*}" | sed 's/ | $//')
else
  MODELS_LIST="${MODEL_R1} | ${MODEL_R2} | ${MODEL_R3}"
fi

VOTE_BAND_REPORT=""
for v in $(seq "$NUM_ROUNDS" -1 1); do
  count="${VOTE_BAND[$v]:-0}"
  [ "$count" -eq 0 ] && continue
  tag=""
  [ "$v" = "$NUM_ROUNDS" ] && tag=" (unanimous)"
  [ "$v" = 1 ]            && tag=" (low confidence)"
  VOTE_BAND_REPORT+="  ${v}/${NUM_ROUNDS} votes: ${count}${tag}"$'\n'
done
[ -z "$VOTE_BAND_REPORT" ] && VOTE_BAND_REPORT="  (no findings)"

FAILOVER_SECTION=""
if [ -n "$FAILOVER_TIER" ]; then
  agents_csv=$(printf '%s, ' "${CLI_AGENTS[@]%%|*}" | sed 's/, $//')
  FAILOVER_SECTION=$(cat <<EOF

### ⚠️ Provider failover

Primary (Ollama Cloud) was unavailable.
Tier: ${FAILOVER_TIER} | Reason: ${FAILOVER_REASON}
Agents: ${agents_csv}
Action: regenerate OLLAMA_API_KEY at https://ollama.com/settings/keys
EOF
)
fi

CONFIRMED_COUNT=$(jq '[.[] | select(.ruling=="CONFIRM")]  | length' "$RUN_DIR/arbiter.json")
ESCALATED_COUNT=$(jq '[.[] | select(.ruling=="ESCALATE")] | length' "$RUN_DIR/arbiter.json")
DISMISSED_COUNT=$(jq '[.[] | select(.ruling=="DISMISS")]  | length' "$RUN_DIR/arbiter.json")
DEFERRED_COUNT=$( jq '[.[] | select(.ruling=="DEFER")]    | length' "$RUN_DIR/arbiter.json")
ADDED_NEW_COUNT=$(jq '[.[] | select(.added_new == true)]  | length' "$RUN_DIR/arbiter.json")

PR_URL=$(gh pr view "$PR_NUMBER" --json url --jq '.url')
```

---

## STEP 7: Single Commit + Push

```bash
git add -A
git restore --staged .claude/skills/fix-review/telemetry.jsonl 2>/dev/null || true

if [ "$(git diff --cached --name-only | wc -l)" -eq 0 ]; then
  echo "No fixes applied — nothing to commit."
  COMMIT_SHA="(no-op)"
else
  git commit -m "fix(pr#${PR_NUMBER}): address /fix-review findings

$(jq -r '.[] | select(.ruling == "CONFIRM" or .ruling == "ESCALATE")
       | "- \(.file):\(.line) — \(.body | gsub("\n"; " ") | .[0:80])"' \
       "$RUN_DIR/arbiter.json" | head -20)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  git push
  COMMIT_SHA=$(git rev-parse --short HEAD)
fi
```

---

## STEP 8: Optional PR Summary Comment

If `post_summary_to_pr: true`:

```bash
gh pr comment "$PR_NUMBER" --body "$(cat <<EOF
<details>
<summary>/fix-review — ${ACTIVE_PROVIDER} parallel · ${TOTAL_FINDINGS} findings · ${CONFIRMED_COUNT} fixed · ${DISMISSED_COUNT} dismissed</summary>

Wall time: ${WALL_TIME_MS} ms (sum-sequential ${SEQ_SUM_MS} ms — ${SPEEDUP}× speedup)
Models: ${MODELS_LIST}
Arbiter: Claude

| File:Line | Votes | Layer | Sev | Ruling |
|-----------|-------|-------|-----|--------|
$(jq -r --argjson n "$NUM_ROUNDS" '.[] | "| \(.file):\(.line) | \(.votes)/\($n) | L\(.layer) | \(.severity) | \(.ruling) |"' "$RUN_DIR/arbiter.json")

</details>
EOF
)"
```

---

## STEP 9: Telemetry — JSONL Append

```bash
if [ "$TELEMETRY_ENABLED" = "true" ]; then
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  ROUND_PROVIDER="$ACTIVE_PROVIDER"

  for N in $(seq 1 "$NUM_ROUNDS"); do
    meta="$RUN_DIR/round_${N}.meta"
    [ -f "$meta" ] || continue
    MODEL=$(sed -n '1p' "$meta")
    DURATION_MS=$(sed -n '2p' "$meta")
    read PROMPT_TOKENS COMPLETION_TOKENS < <(sed -n '3p' "$meta")
    FINDINGS_COUNT=$(jq 'length' "$RUN_DIR/round_${N}.findings.json")

    jq -cn \
      --arg    ts        "$TIMESTAMP" \
      --argjson pr       "${PR_NUMBER}" \
      --argjson round    "${N}" \
      --arg    model     "$MODEL" \
      --arg    provider  "$ROUND_PROVIDER" \
      --argjson findings "${FINDINGS_COUNT}" \
      --argjson ptokens  "${PROMPT_TOKENS:-null}" \
      --argjson ctokens  "${COMPLETION_TOKENS:-null}" \
      --argjson cost     "null" \
      --argjson duration "${DURATION_MS}" \
      '{timestamp:$ts, pr_number:$pr, round_number:$round, model:$model,
        provider:$provider, findings_count:$findings,
        prompt_tokens:$ptokens, completion_tokens:$ctokens,
        estimated_cost_usd:$cost, duration_ms:$duration, parallel:true}' \
      >> "$TELEMETRY_FILE" 2>/dev/null \
      || echo "warn: telemetry write failed for round ${N}" >&2
  done

  jq -cn \
    --arg    ts          "$TIMESTAMP" \
    --argjson pr         "${PR_NUMBER}" \
    --arg    round       "arbiter" \
    --arg    model       "claude" \
    --arg    provider    "local" \
    --argjson confirmed  "${CONFIRMED_COUNT}" \
    --argjson escalated  "${ESCALATED_COUNT}" \
    --argjson dismissed  "${DISMISSED_COUNT}" \
    --argjson added_new  "${ADDED_NEW_COUNT}" \
    --argjson wall       "${WALL_TIME_MS}" \
    '{timestamp:$ts, pr_number:$pr, round_number:$round, model:$model,
      provider:$provider, confirmed:$confirmed, escalated:$escalated,
      dismissed:$dismissed, added_new:$added_new,
      parallel:true, wall_time_ms:$wall}' \
    >> "$TELEMETRY_FILE" 2>/dev/null \
    || echo "warn: telemetry write failed for arbiter" >&2
fi
```

---

## STEP 10: Auto-merge (or ask if blocked)

```bash
MERGEABLE=$(gh pr view "$PR_NUMBER" --json mergeable --jq '.mergeable')
HAS_REVERT=$(jq -e 'any(.[]?; .ruling == "reverted")' "$RUN_DIR/arbiter.json" >/dev/null 2>&1 && echo "yes" || echo "no")
GATES_OK="${GATES_OK:-no}"
CHECKS_OUT=$(gh pr checks "$PR_NUMBER" 2>&1 || true)
if echo "$CHECKS_OUT" | grep -qE '^[a-zA-Z0-9_./-]+\s+(fail|error|cancelled)'; then
  CHECKS_OK=no
else
  CHECKS_OK=yes
fi

BLOCKING=()
[ "$MERGEABLE" != "MERGEABLE" ] && BLOCKING+=("PR not mergeable: ${MERGEABLE}")
[ "$HAS_REVERT" = "yes" ]       && BLOCKING+=("one or more fixes reverted")
[ "$GATES_OK"  != "yes" ]       && BLOCKING+=("bundle exec jekyll build failed in a layer this PR touches")
[ "$CHECKS_OK" != "yes" ]       && BLOCKING+=("remote checks failing — see 'gh pr checks ${PR_NUMBER}'")

if [ ${#BLOCKING[@]} -eq 0 ]; then
  if ! gh pr merge "$PR_NUMBER" --auto --squash --delete-branch 2>/dev/null; then
    gh pr merge "$PR_NUMBER" --squash --delete-branch
  fi
  MERGE_STATUS="merged (squash)"
else
  cat <<EOM
PR #${PR_NUMBER} cannot auto-merge:
$(printf '  - %s\n' "${BLOCKING[@]}")

What should I do?
  1. Merge anyway (squash + delete branch)
  2. Leave open — you'll handle it manually
  3. Close PR — abandon
EOM
fi
```

---

## STEP 11: Final Summary (printed)

```
## /fix-review (parallel) — PR #${PR_NUMBER}

Provider: ${ACTIVE_PROVIDER}
Rounds:   ${NUM_ROUNDS}
Models:   ${MODELS_LIST}
Wall time: ${WALL_TIME_MS} ms (sum-sequential ${SEQ_SUM_MS} ms — ${SPEEDUP}× speedup)

Aggregated findings: ${TOTAL_FINDINGS}
${VOTE_BAND_REPORT}

Arbiter:
  Confirmed: ${CONFIRMED_COUNT}
  Escalated: ${ESCALATED_COUNT}
  Dismissed: ${DISMISSED_COUNT}
  Deferred:  ${DEFERRED_COUNT}
  Added new: ${ADDED_NEW_COUNT}

Build: ${TEST_RESULT}

Commit: ${COMMIT_SHA}
PR:     ${PR_URL}
Merge:  ${MERGE_STATUS}
Telemetry: ${TELEMETRY_FILE}
${FAILOVER_SECTION}
```
