---
applyTo: "_posts/**/*.md"
---

# Blog Post Conventions

## Required front matter (all fields mandatory)

```yaml
layout: post
title: "..."
date: YYYY-MM-DD
permalink: /blog/YYYY/MM/DD/slug/
category: methodology | ai-practice | deep-dive | case-study | release-notes | thoughts
tags: [...]
lang: en   # or: uk
description: "One sentence, under 160 chars"
excerpt: "First paragraph of the post"
image: /path/to/hero-image.png
```

## Post body rules

- First content line must be `![descriptive alt](same path as image: field)` — hero image inline
- EN post (`lang: en`) must have a UK sibling (`lang: uk`) with identical `permalink`
- UK file name: same slug + `-uk` suffix, e.g. `2026-04-17-my-post-uk.md`
- Code blocks: fenced with triple backticks + language tag, never indented
- No mixing of English and Ukrainian content in the same file

## Image paths

- Blog post images: `/assets/images/posts/<slug>/filename.png`
- Reusing project images is allowed: `/projects/assets/images/<project>/filename.png`
- `image:` field and the first `![...](...)` must reference the same path
