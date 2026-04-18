# Copilot Instructions — valpere.github.io

Jekyll 4.4.1 portfolio site with jekyll-polyglot bilingual support (EN/UK). Minima 2.5 theme with full custom SCSS override.

## Architecture

- `_posts/` — blog posts; every EN post (`lang: en`) must have a UK variant (`lang: uk`) with the same `permalink`
- `_data/projects.yml`, `_data/portfolio.yml` — data-driven cards; layouts iterate these files
- `_sass/` — custom SCSS; `_tokens.scss` defines all CSS variables; never use hardcoded color values
- `_layouts/`, `_includes/` — custom layouts and partials; Minima is a fallback only
- `assets/images/posts/<slug>/` — blog post images; `projects/assets/images/<project>/` — project images

## Front Matter Rules

### Blog posts (`_posts/*.md`)
Required fields — flag if any are missing:
```yaml
layout: post
title: "..."
date: YYYY-MM-DD
permalink: /blog/YYYY/MM/DD/slug/
category: <one of: methodology, ai-practice, deep-dive, case-study, release-notes, thoughts>
tags: [tag1, tag2]
lang: en   # or uk
description: "..."
excerpt: "..."
image: /path/to/hero.png
```
- `image:` front matter must match the first inline image in the post body
- First line after front matter must be `![alt text](same path as image: field)`
- UK variant must have identical `permalink` to EN variant

### Project/portfolio pages
- `layout: project` or `layout: portfolio-item`
- Must have `permalink`, `title`, `hero_image`, `tech` array

## SCSS Rules (`_sass/*.scss`)

- Use CSS variables from `_tokens.scss`, never raw hex values
- Key tokens: `--brand-green: #168A53`, `--brand-yellow: #FED74F`, `--brand-black: #0a0a0a`, `--brand-white: #ffffff`, `--brand-surface: #f8f7f2`
- `pre` blocks: must have `background: var(--brand-black)` and `color: var(--brand-white)` — light background on `pre` causes invisible code
- `pre code` inside must reset: `background: none; border: none; padding: 0; color: inherit`

## Bilingual Rules

- EN page and UK page share identical `permalink` — polyglot serves UK at `/uk/` prefix automatically
- Navigation labels come from `_data/nav.yml` — both `label` (EN) and `label_uk` (UK) must be present
- No bilingual content mixing in a single file (no EN + UA blocks in the same `.md`)

## General

- No hardcoded strings that duplicate `_data/` content — use data files
- Images: always include `loading="lazy"`, `width`, `height` attributes on `<img>` tags in HTML
- `_site/`, `.jekyll-cache/`, `.sass-cache/`, `.worktrees/` are build artifacts — never commit
- `CLAUDE.md` is excluded from the Jekyll build (`exclude:` in `_config.yml`) — do not add content there intended for the site
