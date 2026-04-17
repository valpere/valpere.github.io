---
layout: post
title: "Jekyll + Polyglot on GitHub Pages: What Actually Works in 2026"
date: 2026-02-15
permalink: /blog/2026/02/15/jekyll-polyglot-github-pages/
category: thoughts
tags: [jekyll, polyglot, github-actions, i18n, github-pages]
lang: en
description: "Practical notes from migrating a Jekyll site to jekyll-polyglot with GitHub Actions — the static_href trick, gitignore gotchas, and what the docs don't tell you."
excerpt: "I spent more time than I should have getting jekyll-polyglot working correctly on GitHub Pages. The issues were not conceptually hard, but each one was invisible until it bit me. These are the notes I wished existed when I started."
---

I spent more time than I should have getting jekyll-polyglot working correctly on GitHub Pages. The issues were not conceptually hard, but each one was invisible until it bit me. These are the notes I wished existed when I started.

## GitHub Pages Will Not Run Polyglot

GitHub Pages maintains a whitelist of allowed Jekyll plugins. `jekyll-polyglot` is not on it. If you add it to your `_plugins/` directory or `Gemfile` and push, GitHub Pages will silently build without it — no error, just a site with no language support and some broken links.

The fix is to take the build out of GitHub Pages entirely and use GitHub Actions to build and deploy:

```yaml
# .github/workflows/deploy.yml
name: Deploy Jekyll site
on:
  push:
    branches: [main]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
          bundler-cache: true
      - run: bundle exec jekyll build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

The `peaceiris/actions-gh-pages` action pushes `_site/` contents to the `gh-pages` branch, which GitHub Pages serves as a static host. You lose the simplicity of push-to-deploy, but you gain full plugin support.

## The URL Rewriting Surprise

Polyglot's core feature is rewriting URLs on non-default-language pages so that `/about/` becomes `/uk/about/` when building the Ukrainian version. This happens automatically for all root-relative hrefs in your HTML output.

The surprise: this includes your language switcher.

If your language switcher has a link like `<a href="/about/">English</a>`, polyglot will rewrite it to `/uk/about/` on the Ukrainian page — which means clicking "English" keeps you in Ukrainian. A self-link, invisibly.

The fix is `static_href`:

{% raw %}
```html
{% static_href %}href="/about/"{% endstatic_href %}
```
{% endraw %}

Polyglot sees this tag and leaves the URL alone regardless of which language page is being built. It is not pretty Liquid, but it is the correct tool for links that must not be localized.

## `data-no-localization` Does Not Work for Relative URLs

The polyglot docs mention a `data-no-localization` attribute that is supposed to prevent URL rewriting on specific elements. In practice, this works for absolute URLs (`https://...`) but not for root-relative URLs (`/path/to/page`). The rewriting logic does not check for this attribute on relative href values.

This is not a bug in your configuration. Use `static_href` tags for language switcher links. Do not spend an afternoon tweaking `data-no-localization` attributes.

## Gemfile and Git

Many Jekyll project templates list `Gemfile.lock` in `.gitignore` but do not track `Gemfile` at all — the assumption being that the Gemfile is "obvious" local configuration. This breaks badly when you add GitHub Actions to your build, because the Actions runner starts fresh with no Gemfile.

Make sure both `Gemfile` and `Gemfile.lock` are committed:

```bash
git add Gemfile Gemfile.lock
git commit -m "Track Gemfile and lock for CI"
```

The `Gemfile.lock` pin ensures the Actions runner uses exactly the same gem versions you tested locally, which prevents the "works on my machine, fails in CI" failure mode.

## The Global Gitignore Trap

This one took an embarrassingly long time to diagnose. My global `~/.gitignore_global` included the pattern `_*`, which I had added years ago to ignore scratch directories prefixed with underscores.

Jekyll's content directories are all prefixed with underscores: `_layouts/`, `_includes/`, `_data/`, `_posts/`, `_sass/`. All of them matched the global ignore pattern. Git would not track them.

`git status` showed a clean working tree. `git add _layouts/` silently did nothing. The site built locally because the files existed on disk; it failed in CI because they were never committed.

The fix is explicit negation in the project's `.gitignore`:

```gitignore
# Undo global _* ignore for Jekyll directories
!_layouts/
!_includes/
!_data/
!_posts/
!_sass/
!_config.yml
```

Alternatively, remove the `_*` pattern from your global gitignore if you do not actually need it. I kept the project-level negation because other machines might have the same global pattern.

## One More: Exclude Directories from Localization

By default, polyglot will try to localize everything, including your `assets/` directory. This produces duplicate copies of your CSS and images under `/uk/assets/`, which is wasteful and can cause caching issues.

Add explicit exclusions in `_config.yml`:

```yaml
exclude_from_localization:
  - assets
  - robots.txt
  - sitemap.xml
```

Polyglot will leave these paths alone when building non-default language versions.

Once all these pieces are in place, the polyglot setup is genuinely clean: one source file per piece of content, `lang:` in the front matter, and the plugin handles the rest. Getting to that point just requires knowing where the traps are.
