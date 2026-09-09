---
name: apply-dreaming
description: "Read the latest valpere.github.io dreaming report and
  apply high-confidence findings. Content/nav/image fixes go through
  a branch + PR + /fix-review, same as any other change in this repo
  — no /backlog or /ship pipeline here. Annotates report with
  [applied YYYY-MM-DD] markers."
user-invocable: true
argument-hint: "[week|latest]"
---

# /apply-dreaming (valpere.github.io)

Walks each dreaming-report finding interactively and leaves an audit
trail (`[applied YYYY-MM-DD]` / `[skipped …]` markers appended to the
report).

## When to invoke

- Monday morning after the Sunday cron-run produced a fresh report.
- Or any time after a manual `.claude/dreaming/dreaming.sh` run.
- Or `/apply-dreaming` (with optional `latest` or `2026-W##` argument).

## Inputs

- Optional argument: `latest` (default) or `YYYY-W##`.
- Project root: `~/wrk/projects/github_pages/valpere.github.io/`.

## Steps

### 1. Locate report

```bash
WEEK="${1:-latest}"
DIR=".claude/dreaming/reports"
if [[ "$WEEK" == "latest" ]]; then
  REPORT=$(find "$DIR" -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-W*.md' \
           -printf '%T@ %p\n' 2>/dev/null \
           | sort -rn | head -1 | cut -d' ' -f2-)
else
  REPORT="$DIR/$WEEK.md"
fi
```

### 2. Parse into structured items

Read REPORT. For each numbered sub-item under a section, extract:

- `id`, `title`, `confidence` (high/medium/low)
- `evidence` — file path(s), PR number, commit sha
- `suggestion`
- `category` — infer from the suggestion:
  - "add missing `-ua.md`" / "fix bilingual pairing" → `content-fix`
  - "add to `_config.yml`" / "add to index.md" → `nav-fix`
  - "fix broken image reference" → `asset-fix`
  - "new `CLAUDE.md` convention" → `update-tooling`
  - else → `other`

**Confidence inheritance.** If a sub-item has no explicit `confidence`
field, inherit it from the enclosing section. Default `medium` only
when neither declares one.

**Idempotency — skip already-marked items.** If the next non-blank
line after an item starts with `> [applied …]` or `> [skipped …]`,
skip it silently. The report is appended to (never rewritten) on each
pass. Print a summary at the start: `2026-W##: M new items (N
already-processed skipped)`.

### 3. Show TL;DR + counts

```
2026-W##: N items (X high, Y medium, Z low)
TL;DR: ...
Process all? [y/select/skip-low/abort]
```

### 4. Triage walk

Iterate `high → medium → low`. For each item:

```
[H 1/N] §<id>  <title>
  Evidence: <file path(s)>
  Suggestion: <suggestion>

  [a]pply / [s]kip / [v]erify-first / [e]vidence / [q]uit
```

For `low`: skip silently unless the user opted in at step 3.

### 5. Apply per category

All categories go through the same path — this repo has no
`/backlog`/`/ship` pipeline, so every change (content, nav, tooling)
is a normal branch + commit + push + PR + `/fix-review`:

1. `git switch -c dreaming-w##-<slug>` off `main`.
2. Make the fix:
   - `content-fix`: create/edit the missing bilingual counterpart.
     Match the existing sibling's structure and tone — don't
     machine-translate blindly, read the sibling file first.
   - `nav-fix`: add/remove the entry in `_config.yml`'s `header_pages`
     or the relevant `index.md` listing.
   - `asset-fix`: fix the broken path, or flag for the user to supply
     the missing image (don't fabricate an image).
   - `update-tooling`: edit `CLAUDE.md` directly — this file documents
     conventions, no separate gate needed for a doc-only change.
3. Commit, push, open a PR referencing the dreaming finding (`§<id>`).
4. Run `/fix-review <PR#>`.
5. Merge once `/fix-review` findings are addressed and CI is green
   (per the standard Git & PR workflow in the global CLAUDE.md).

#### `other` — manual review

Print suggestion + evidence. Don't apply. Annotate
`[manual-review-required 2026-MM-DD]`.

### 6. Annotate report

After each applied item, append (never rewrite the original):

```markdown
> [applied 2026-MM-DD: <action>; commit <sha>; PR <num>]
```

For skipped:
```markdown
> [skipped 2026-MM-DD: <reason>]
```

### 7. Final summary

```
Applied: N
Manual review: K
Skipped: P

PRs opened: <list>

Next steps: review + merge each PR once /fix-review + CI are green.
```

## Constraints (CRITICAL)

- **NEVER commit or push directly to `main`** — branch + PR for every
  change, content included.
- **NEVER fabricate a missing image** — flag it for the user instead.
- **NEVER machine-translate a bilingual counterpart blindly** — read
  the existing sibling's structure/tone first; if genuinely unsure of
  the Ukrainian phrasing, flag for manual review instead of guessing.
- **NEVER auto-apply low confidence** without explicit request.
- **ALWAYS cite report-section** (`§<id>`) in commit messages and PR bodies.
- **Confirm before destructive ops** (deleting an orphaned page) even
  at high confidence.

## Anti-patterns

- ❌ Commit or push to `main` directly.
- ❌ Skip `/fix-review` on the PR.
- ❌ Modify the report's original suggestions (annotate only).
- ❌ Apply a finding without verifying it against the actual repo
  state first — the dreaming pass is a heuristic read, it can be wrong.

## Companion skills

- `/fix-review` — parallel multi-model review + Claude Arbiter.
- `/housekeeping` — synchronous repo-health snapshot, complementary to dreaming.

## See also

- `.claude/dreaming/dreaming-prompt.md` — what the dreaming pass looks for.
- `.claude/dreaming/dreaming.sh` — how the pass is run (systemd timer).
