---
name: housekeeping
description: "Recurring repo health check for valpere.github.io. Runs universal hygiene checks plus Jekyll-specific checks and outputs a pass/fail table. Usage: /housekeeping"
---

# Skill: /housekeeping
# Repo Health Check — valpere.github.io

---

## OVERVIEW

```
/housekeeping  →  run checks  →  Markdown table: Check | Status | Detail
                              →  Summary: N passed, M failed
```

Read-only. Never modifies files, never commits, never opens a PR.
Run any time for a hygiene snapshot. Any FAIL = exit signal to fix before shipping.

Universal checks 1-5 mirror `~/wrk/common/skills/housekeeping/SKILL.md`
(debug-output, tracked-backup, and layout-drift checks omitted — not
relevant for a Jekyll content site with no `src/`/`backup/`/`../context/`
convention). Checks 6-10 are Jekyll-specific.

---

## UNIVERSAL CHECKS

### Check 1 — Stale Local Branches

**Goal:** ≤ 10 local branches after pruning remote-tracking refs.

```bash
git remote prune origin 2>&1 | tail -3
LOCAL_COUNT=$(git branch | grep -v '^\*' | wc -l | tr -d ' ')
```

**Pass:** `LOCAL_COUNT <= 10`
**Fail:** "N local branches — prune merged ones"

Cleanup tip:
```bash
git branch --merged main | grep -v 'main\|^\*'
# delete with: git branch -d <branch>
```

---

### Check 2 — Tracked .env File

**Goal:** `.env` must not be tracked by git (would leak secrets).

```bash
TRACKED=$(git ls-files .env 2>/dev/null)
```

**Pass:** empty result
**Fail:** "`.env` is tracked — add to .gitignore and run `git rm --cached .env`"

---

### Check 3 — TODO/FIXME Count (informational)

**Goal:** Report count. No threshold — visibility only.

```bash
COUNT=$(grep -rE "TODO|FIXME" \
  --include="*.md" --include="*.yml" --include="*.yaml" --include="*.scss" \
  --exclude-dir=_site --exclude-dir=.jekyll-cache --exclude-dir=.git --exclude-dir=.claude \
  . 2>/dev/null | wc -l | tr -d ' ')
```

**Status:** Always `INFO`.
**Detail:** "N TODO/FIXME comments" — append " (consider a cleanup sprint)" if > 20.

This check never contributes to the failed count.

---

### Check 4 — CLAUDE.md Key Files Exist

**Goal:** files explicitly listed under a "Key Files" / "Ключові файли"
section of `CLAUDE.md` should actually exist on disk.

```bash
MISSING=""
if [ -f CLAUDE.md ]; then
  MISSING=$(awk '
    /^##.*[Kk]ey [Ff]iles|^##.*[Кк]лючов.*файл/ {in_section=1; next}
    /^##/ && in_section {in_section=0}
    in_section
  ' CLAUDE.md | grep -oE '`[^`]+`' | tr -d '`' | while read f; do
    case "$f" in
      */*|*.md|*.yml|*.yaml|*.scss|*.html)
        [ -e "$f" ] || echo "$f"
        ;;
    esac
  done)
fi
```

**Pass:** all listed files exist (or no Key Files section).
**Fail:** list missing paths — likely doc drift after a rename/delete.
**Skip:** no `CLAUDE.md` at repo root, or no Key Files section.

---

### Check 5 — Skill Temp Dir Accumulation (informational)

**Goal:** report `/tmp/<skill>-*` directories older than 7 days from
interactive skill runs (`fix-review`, etc).

```bash
COUNT=$(find /tmp -maxdepth 1 -type d -mtime +7 \
  -name 'fix-review-*' \
  2>/dev/null | wc -l | tr -d ' ')
```

**Status:** Always `INFO`.
**Detail:** "N stale skill temp dirs in /tmp" — append " (rm -rf /tmp/fix-review-* to clean)" if > 5.

This check never contributes to the failed count.

---

## JEKYLL-SPECIFIC CHECKS

### Check 6 — Jekyll Build Health

**Goal:** the site builds cleanly.

```bash
BUILD_OUT=$(bundle exec jekyll build 2>&1)
BUILD_EXIT=$?
LIQUID_ISSUES=$(printf '%s' "$BUILD_OUT" | grep -E "Liquid Warning|Liquid Exception")
```

**Pass:** `BUILD_EXIT == 0` and no `Liquid Warning`/`Liquid Exception` lines.
**Fail:** print the Liquid warning/exception lines, or the build's non-zero exit.
**Note:** ignore SASS deprecation warnings — they come from the `minima`
theme, not this site's own code.

---

### Check 7 — Gemfile.lock Sync

**Goal:** `Gemfile.lock` matches `Gemfile`.

```bash
bundle check >/dev/null 2>&1
BUNDLE_OK=$?
```

**Pass:** `BUNDLE_OK == 0`
**Fail:** "Gemfile.lock out of sync — run `bundle install`"

---

### Check 8 — og:image Frontmatter Must Be a String

**Goal:** no post/page sets `image:` (or `og_image:`) to a YAML hash —
jekyll-seo-tag 2.8.0 breaks the `<meta property="og:image">` tag on a
hash value instead of a plain string path.

```bash
OFFENDERS=$(grep -rln "^image:\s*{" --include="*.md" \
  --exclude-dir=_site --exclude-dir=.jekyll-cache . 2>/dev/null)
```

**Pass:** empty result.
**Fail:** list offending files — fix by replacing the hash with a plain
string path (see `.claude/skills/fix-review/docs-prompt.txt` for the
documented failure mode).

---

### Check 9 — Bilingual Pairing (informational)

**Goal:** report `_posts/*.md` entries without a `-uk.md` twin, or
`-uk.md` entries without a base-language twin. Asymmetry can be
intentional (EN-only or UK-only pieces) — this is visibility only,
never a failure.

```bash
MISSING_UK=""
MISSING_BASE=""
for f in _posts/*.md; do
  [ -f "$f" ] || continue
  case "$f" in
    *-uk.md)
      base="${f%-uk.md}.md"
      [ -f "$base" ] || MISSING_BASE="$MISSING_BASE $f"
      ;;
    *)
      twin="${f%.md}-uk.md"
      [ -f "$twin" ] || MISSING_UK="$MISSING_UK $f"
      ;;
  esac
done
```

**Status:** Always `INFO`.
**Detail:** "N EN posts without a UK twin" / "N UK posts without a base twin" — list up to 5 filenames, then "+ N more".

This check never contributes to the failed count.

---

### Check 10 — Broken Internal Links (best-effort)

**Goal:** flag `[text](/some/path/)`-style internal links that don't
resolve to any file in the repo.

```bash
LINKS=$(grep -rohE '\]\([/][a-zA-Z0-9/_.-]+/?\)' \
  --include="*.md" \
  --exclude-dir=_site --exclude-dir=.jekyll-cache --exclude-dir=.claude \
  . 2>/dev/null | grep -oE '/[a-zA-Z0-9/_.-]+/?' | sort -u)

BROKEN=""
for link in $LINKS; do
  path="${link#/}"
  path="${path%/}"
  # try as directory index, direct file, or .md source
  if [ -f "${path}/index.md" ] || [ -f "${path}.md" ] || [ -f "${path}" ] || [ -d "$path" ]; then
    continue
  fi
  BROKEN="$BROKEN $link"
done
```

**Pass:** empty `BROKEN` list.
**Fail:** list broken-looking links (up to 10, then "+ N more") — treat
as "worth a manual look," not a final verdict.
**Known limitation:** does not understand Jekyll's permalink rewrite
(`_posts/YYYY-MM-DD-slug.md` → `/blog/YYYY/MM/DD/slug/`), so it
under-reports rather than over-reports. **Must exclude `.claude/`** —
without it, example links inside skill docs (like this file) produce
false positives.

---

## OUTPUT FORMAT

```
## /housekeeping — Repo Health Report

| Check | Status | Detail |
|-------|--------|--------|
| Stale local branches | PASS | 6 local branches |
| Tracked .env | PASS | — |
| TODO/FIXME count | INFO | 4 TODO/FIXME comments |
| CLAUDE.md key files | SKIP | no Key Files section |
| Skill temp dirs | INFO | 2 stale skill temp dirs in /tmp |
| Jekyll build health | PASS | — |
| Gemfile.lock sync | PASS | — |
| og:image frontmatter | PASS | — |
| Bilingual pairing | INFO | 5 EN posts without a UK twin |
| Broken internal links | PASS | — |

**8 passed, 0 failed** (2 informational, 1 skipped)
```

Status values:
- `PASS` — check succeeded
- `FAIL` — check failed (must be addressed)
- `INFO` — informational only, never counted as failed
- `SKIP` — could not run (missing tools, no artifacts)

Summary: `N passed, M failed` — with optional `(K informational, J skipped)`.

---

## RULES

1. **Read-only** — never modify files, commit, push, or open a PR.
2. **Run from repo root** — all paths relative to repository root.
3. **INFO checks never count as failures.**
4. **SKIP is not failure** — a skipped check doesn't increment failed count.
5. **Graceful degradation** — if a tool is unavailable, mark check SKIP and continue.
6. **No auto-fix** — this skill reports; fix findings manually or via the appropriate PR workflow.
7. **Exit signal** — if any check is FAIL, end with: "Run /housekeeping again after fixing the issues above."
