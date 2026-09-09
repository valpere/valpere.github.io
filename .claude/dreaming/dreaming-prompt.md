You are doing a **dreaming pass** for the **valpere.github.io** project
(github_pages) — async, scheduled curation of project context. This is
sleep-time consolidation: review what accumulated since last pass,
identify patterns, suggest curation. Read-only — output a report, don't
modify anything.

## Project context

- **valpere.github.io** — personal GitHub Pages portfolio/projects site,
  Jekyll + Minima theme (solarized-light skin).
- Bilingual content pattern: every `projects/<name>.md` (English) should
  have a matching `projects/<name>-ua.md` (Ukrainian).
- Navigation is controlled centrally in `_config.yml`'s `header_pages`.
- No `/backlog`/`/ship` pipeline here — changes go through a branch +
  PR + `/fix-review`, reviewed and merged directly.

## Targets

| Path | What to look for |
|------|-------------------|
| `projects/*.md` vs `projects/*-ua.md` | English entries with no Ukrainian counterpart (or vice versa) — broken bilingual pairing |
| `portfolio/*.md` vs `portfolio/*-ua.md` | Same bilingual-pairing check for portfolio entries |
| `_config.yml` `header_pages` | Pages that exist but aren't linked in nav, or nav entries pointing at deleted files |
| `projects/index.md` / `portfolio/index.md` | Listing pages missing an entry that exists as a standalone `.md` file (added but never linked from the index) |
| Image references (`assets/images/`, `projects/assets/images/<project>/`, `portfolio/assets/images/<client>/`) | `.md` files referencing an image path that doesn't exist on disk |
| Recent PR review comments | Recurring `/fix-review` themes across merged PRs (`gh pr list --state merged --limit 20`) |
| `.claude/skills/` | Only `fix-review`/`housekeeping`/`session-end` exist here — flag if any drifted or now overlaps |

## What to find

### 1. Bilingual pairing gaps

For each `.md` file under `projects/` and `portfolio/` that does NOT
end in `-ua.md`, check whether a `-ua.md` sibling exists. Flag any
one-sided pair (English without Ukrainian, or — less likely but
check — Ukrainian without English).

### 2. Navigation / index drift

Cross-check `projects/index.md` and `portfolio/index.md` list every
`.md` file physically present in their respective directories (minus
`index.md` itself and `-ua.md` variants, which are linked from their
English sibling, not the index directly). Flag orphaned pages (exist,
not listed) and dead links (listed, file missing).

### 3. Image reference integrity

Grep `.md` files for image paths (`![...](...)`  / `<img src=...>`)
under `assets/images/`, `projects/assets/images/`,
`portfolio/assets/images/` and verify the referenced file exists.
Flag broken references.

### 4. Recurring `/fix-review` themes

`gh pr list --state merged --limit 20` + `gh pr view N --json comments`
on a sample of recent PRs. A theme repeating across 3+ PRs (e.g. a
recurring i18n mistake, a recurring layout issue) is worth a CLAUDE.md
convention addition.

### 5. Filename pattern drift

Image filenames are supposed to follow
`<description>-<sequence>-<width>x<height>.<ext>` per CLAUDE.md. Spot-
check a sample of recently added images (`git log --since="30 days
ago" --diff-filter=A -- '*.png' '*.jpg' '*.webp'`) against this pattern.

## Report format

```markdown
# valpere.github.io dreaming — <ISO week>

## TL;DR
<3-5 bullet summary>

## 1. Bilingual pairing gaps
### a) <finding>
- Confidence: high|medium|low
- Evidence: <file path(s)>
- Suggest: <action>

## 2. Navigation / index drift
...

## 3. Image reference integrity
...

## 4. Recurring /fix-review themes
...

## 5. Filename pattern drift
...

## 6. Open questions
<what you couldn't verify from a read-only pass>
```

Confidence levels: **high** = directly verified (file exists/doesn't,
link resolves/doesn't); **medium** = pattern observed but not
exhaustively checked; **low** = a hunch worth someone's attention, not
a confirmed finding. Don't fabricate evidence — say "couldn't verify"
rather than guess.
