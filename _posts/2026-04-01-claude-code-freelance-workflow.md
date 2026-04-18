---
layout: post
title: "Claude Code in Freelance: How I Ship Faster Without Cutting Corners"
date: 2026-04-01
permalink: /blog/2026/04/01/claude-code-freelance-workflow/
category: ai-practice
tags: [claude-code, ai, workflow, freelance]
lang: en
description: "How I integrated Claude Code's subagent-driven development into real freelance projects — concrete workflow, lessons, and tradeoffs."
excerpt: "Six months ago I started using Claude Code as a primary development tool on client work. Not as an autocomplete or a rubber duck, but as a structured part of a repeatable workflow. Here is what that actually looks like in practice."
image: /projects/assets/images/vibe_coding/ai+low-code_fusion-1-0768x0512.png
---

![AI and low-code fusion in freelance workflow](/projects/assets/images/vibe_coding/ai+low-code_fusion-1-0768x0512.png)

Six months ago I started using Claude Code as a primary development tool on client work. Not as an autocomplete or a rubber duck, but as a structured part of a repeatable workflow. Here is what that actually looks like in practice — with the warts included.

## The Workflow in Four Stages

**Stage 1: Planning.** Before any code is written I produce a spec. Not a vague description — a numbered task list with acceptance criteria per task. Claude Code can operate well on a clear task, and it operates poorly on a hazy one. This stage is still 100% human; the AI has no place here until you know what you want.

**Stage 2: Worktrees.** Each task gets its own Git worktree (`git worktree add`). This is the part most people skip, and skipping it is why AI-assisted projects turn into spaghetti. Worktrees give each subagent a clean checkout with no side effects from other in-flight tasks.

**Stage 3: Subagent-driven development.** I invoke Claude Code in each worktree with a tightly scoped prompt: one task, one context window, one outcome. The context isolation is not a limitation — it is the feature. A subagent that cannot see the rest of your codebase cannot make assumptions about it. That forces the prompt to be complete.

**Stage 4: Two-stage review.** Every task gets reviewed twice. First pass: does the implementation match the spec? Second pass: code quality — naming, complexity, whether anything was invented that was not asked for (YAGNI violations are common in AI output). I use GitHub Copilot's PR review for the second pass and have Claude Code apply the fixes. The combination works well: Copilot flags issues, Claude Code fixes them without arguing.

## A Real Example: valpere.github.io Phase 1

My own site rebuild had 11 defined tasks — layout system, SCSS override, polyglot integration, portfolio pages, project pages, and so on. Each task was one worktree, one subagent invocation, one PR. Total wall-clock time across 11 tasks was roughly three days of calendar time, with maybe four hours of active human attention.

Two tasks that looked simple turned out to need careful prompting:

- **SCSS override for Minima.** Minima injects its own `assets/main.scss` via the gem. If your project also has `assets/main.scss`, Jekyll uses yours — but only if it has the right `@import` statements. The gotcha: the generated `_site/assets/main.scss` was empty on first run because the subagent created the file without importing anything. The fix was trivial once diagnosed, but the subagent had no way to know Minima's convention without being told.

- **Polyglot language switcher.** `jekyll-polyglot` rewrites root-relative hrefs on non-default language pages. A language switcher that links to `/about/` will rewrite to `/uk/about/` when rendering the Ukrainian version — including the link that is supposed to stay on the same page. The solution is `static_href` Liquid tags, which polyglot explicitly skips. But the subagent used standard `<a href>` because that is the obvious thing to do. The prompt needed to say "use static_href for the language switcher links" explicitly.

## The Copilot + Claude Combination

GitHub Copilot's PR review is good at catching style issues and potential bugs in isolation. Claude Code is good at applying fixes in context. Running both on every PR takes maybe ten extra minutes per task and has caught real problems — duplicate logic, missing error handling, and one case where the subagent added a configuration option nobody asked for.

## The Real Gotchas

The most painful non-code issue: my global `~/.gitignore_global` had an `_*` pattern to ignore scratch directories. Jekyll's `_layouts/`, `_includes/`, `_data/`, and `_posts/` all match that pattern. The worktrees looked clean but were missing critical directories. This took about an hour to diagnose because `git status` showed nothing wrong — the files were not untracked, they were invisible.

## The Tradeoff

Subagents need precise prompts. That is both the cost and the discipline. Writing a precise prompt forces you to actually think through the task before coding it, which is not a bad habit regardless of tooling. The context isolation means no agent accumulates state or makes cross-task assumptions. You give up the convenience of "the AI remembers what we discussed" and gain reproducibility.

If a task requires subtle judgment about cross-cutting concerns — security, data modeling, novel algorithms — I write that code myself. AI is a force multiplier on execution, not a replacement for design.
