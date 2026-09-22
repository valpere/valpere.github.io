# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal GitHub Pages site (valpere.github.io) built with Jekyll using the Minima theme (solarized-light skin). It serves as a portfolio and projects showcase site.

## Commands

```bash
# Install dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve

# Build static site
bundle exec jekyll build
```

The built site outputs to `_site/` (excluded from git).

## Architecture

The site uses Jekyll's standard content model:

- **`index.md`** — Home page (`layout: home`)
- **`about.md`** — About page (`layout: page`)
- **`projects/index.md`** — Projects listing page; rendered by `_layouts/projects-index.html`, which iterates `site.data.projects` (i.e. `_data/projects.yml` is the source of truth, not file-presence in `projects/`)
- **`portfolio/index.md`** — Portfolio/work history listing page; same data-driven pattern from `_data/portfolio.yml`
- **`projects/*.md`** — Individual detailed project pages (one per project, plus `-ua.md` Ukrainian variants)

To add a new project: add an entry to `_data/projects.yml` (with `slug`, `title`, `title_uk`, `permalink`, `hero_image`, etc.) AND create the matching `projects/<slug>.md` and `projects/<slug>-ua.md` files. The index page is driven by the yml entry, but the detail pages are still required as separate `.md` files.

### Bilingual Content Pattern

Each project has two versions:
- `projects/<name>.md` — English version
- `projects/<name>-ua.md` — Ukrainian version

The `projects/index.md` listing renders summaries from `_data/projects.yml` (the `summary_en` / `summary_uk` fields) and links to the detailed pages via `[More detailed](/projects/<name>/)`.

### Navigation

Controlled in **`_data/nav.yml`** (not in `_config.yml`). Each entry has `label`, `label_uk`, and `url`:

```yaml
- label: "Home"
  label_uk: "Головна"
  url: "/"
```

The current nav entries (as of last edit): Home, About, Portfolio, Projects, Briefs (`/mvb/`), Blog (`/blog/`).

### Theme / Styling

- Theme: `minima` with `skin: solarized-light`
- Custom SCSS goes in `_sass/`
- Custom HTML partials go in `_includes/`

### Assets

- `assets/images/` — Site-wide images
- `projects/assets/images/<project-name>/` — Per-project images
- `portfolio/assets/images/<client-name>/` — Per-portfolio images

Image filenames follow the pattern: `<description>-<sequence>-<width>x<height>.<ext>`
