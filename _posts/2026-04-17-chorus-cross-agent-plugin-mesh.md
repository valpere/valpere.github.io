---
layout: post
title: "chorus: a cross-agent plugin mesh for AI coding CLIs"
date: 2026-04-17
category: release-notes
tags: [AI, chorus, claude-code, opencode, gemini, codex, cursor, kilo, open-source]
lang: en
permalink: /blog/2026/04/17/chorus-cross-agent-plugin-mesh/
description: "chorus is an open-source plugin collection that creates a full 6×6 delegation mesh between Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and Kilo — without leaving your current interface."
image: /assets/images/posts/chorus/infographic-900x530.png
---

![chorus — cross-agent plugin mesh for AI coding CLIs](/assets/images/posts/chorus/infographic-900x530.png)

Most AI coding tools are designed like islands.

You pick one — Claude Code, OpenCode, Gemini CLI, Codex, Cursor, or Kilo — and stay inside its workflow. A second opinion means copying context, switching terminals, re-explaining the task, waiting, comparing answers, and manually carrying the result back.

I built **chorus** to remove that step.

## What it does

chorus is an open-source plugin collection that creates a **full 6×6 delegation mesh** between six AI coding CLIs:

| From \\ To  | Claude | OpenCode | Gemini | Codex | Cursor | Kilo |
|-------------|:------:|:--------:|:------:|:-----:|:------:|:----:|
| Claude Code |   —    |  ✅      |  ✅    |  ✅   |  ✅    |  ✅  |
| OpenCode    |  ✅    |   —      |  ✅    |  ✅   |  ✅    |  ✅  |
| Gemini CLI  |  ✅    |  ✅      |   —    |  ✅   |  ✅    |  ✅  |
| Codex       |  ✅    |  ✅      |  ✅    |   —   |  ✅    |  ✅  |
| Cursor      |  ✅    |  ✅      |  ✅    |  ✅   |   —    |  ✅  |
| Kilo        |  ✅    |  ✅      |  ✅    |  ✅   |  ✅    |   —  |

Each agent can delegate tasks to the other five, without leaving its own interface.

## How it integrates

**Claude Code** gets slash commands:
```
/opencode:run refactor the auth module
/gemini:review check this diff for edge cases
/codex:run write tests for the new retry logic
/cursor:run check if this fits existing codebase patterns
/kilo:run review for naming clarity and maintainability
```

**OpenCode** gets MCP tools:
```
delegate_claude("review this migration for data loss risk")
delegate_gemini("analyze this for performance bottlenecks")
delegate_codex("add integration tests")
delegate_cursor("check pattern consistency across the repo")
delegate_kilo("review for long-term readability")
```

**Gemini CLI**, **Codex**, **Cursor**, and **Kilo** get skills/rules — install once, then delegate in natural language.

## The workflow that actually matters

Parallel code review. Ask five different agents to review the same diff independently, each with a different focus:

```text
/gemini:review   — correctness and edge cases
/codex:run       — test coverage and missing cases
/cursor:run      — codebase integration and pattern consistency
/kilo:run        — maintainability and naming clarity
/claude:review   — security and correctness
```

Different models have genuinely different failure modes. One may miss an edge case another catches. One may overweight architecture where another spots a missing test. You read all five and make the call. The agents provide the raw material; judgment stays with you.

OpenCode participates in the full 6×6 mesh but is excluded from parallel workflow patterns — its TUI stdout isn't capturable programmatically.

## Named workflow commands

Instead of wiring five separate commands with different prompts each time, chorus ships named workflow patterns as first-class installable plugins:

| Command | What it does |
|---|---|
| `/chorus:review` | Parallel review of `git diff HEAD` — one command, 5 independent opinions |
| `/chorus:council` | Same task to all 5 agents with different roles; host synthesizes |
| `/chorus:debug` | Ranked root-cause hypotheses from 5 agents for a bug symptom |
| `/chorus:second-opinion` | Quick independent check from one chosen agent |

OpenCode gets these as MCP tools: `council`, `parallel_review`, `parallel_debug`, `second_opinion`. Gemini CLI, Codex, Cursor, and Kilo get them as skills/rules.

## Install

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode

# Gemini CLI
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
# ... and other agents
```

Full installation for Codex, Cursor, and Kilo is in the [README](https://github.com/valpere/chorus).

chorus is not trying to be a new IDE or orchestration platform. It is plumbing between tools developers already use. One install, six agents, zero new workflows forced on you.

**[https://github.com/valpere/chorus](https://github.com/valpere/chorus)**
