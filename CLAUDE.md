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
- **`projects/index.md`** — Projects listing page with anchor-based TOC for each project entry
- **`portfolio/index.md`** — Portfolio/work history listing page
- **`projects/*.md`** — Individual detailed project pages (one per project, plus `-ua.md` Ukrainian variants)

### Bilingual Content Pattern

Each project has two versions:
- `projects/<name>.md` — English version
- `projects/<name>-ua.md` — Ukrainian version

The `projects/index.md` lists all projects with short English+Ukrainian summaries and links to the detailed pages via `[More detailed](/projects/<name>/)`.

### Navigation

Controlled in `_config.yml` via `header_pages`:
```yaml
header_pages:
  - index.md
  - about.md
  - portfolio/index.md
  - projects/index.md
```

### Theme / Styling

- Theme: `minima` with `skin: solarized-light`
- Custom SCSS goes in `_sass/`
- Custom HTML partials go in `_includes/`

### Assets

- `assets/images/` — Site-wide images
- `projects/assets/images/<project-name>/` — Per-project images
- `portfolio/assets/images/<client-name>/` — Per-portfolio images

Image filenames follow the pattern: `<description>-<sequence>-<width>x<height>.<ext>`
