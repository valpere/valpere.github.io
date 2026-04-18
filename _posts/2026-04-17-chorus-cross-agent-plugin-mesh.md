---
layout: post
title: "chorus: a cross-agent plugin mesh for AI coding CLIs"
date: 2026-04-17
category: release-notes
tags: [AI, chorus, claude-code, opencode, gemini, codex, open-source]
lang: en
permalink: /blog/2026/04/17/chorus-cross-agent-plugin-mesh/
description: "chorus is an open-source plugin collection that creates a 4×3 delegation mesh between Claude Code, OpenCode, Gemini CLI, and Codex — without leaving your current interface."
image: /assets/images/posts/chorus/infographic-900x530.png
---

![chorus — cross-agent plugin mesh for AI coding CLIs](/assets/images/posts/chorus/infographic-900x530.png)

Most AI coding tools are designed like islands.

You pick one — Claude Code, OpenCode, Gemini CLI, or Codex — and stay inside its workflow. A second opinion means copying context, switching terminals, re-explaining the task, waiting, comparing answers, and manually carrying the result back.

I built **chorus** to remove that step.

## What it does

chorus is an open-source plugin collection that creates a **4×3 delegation mesh** between four AI coding CLIs:

| From \ To   | Claude | OpenCode | Gemini | Codex |
|-------------|--------|----------|--------|-------|
| Claude Code |   —    |  ✅      |  ✅    |  ✅   |
| OpenCode    |  ✅    |  —       |  ✅    |  ✅   |
| Gemini CLI  |  ✅    |  ✅      |  —     |  ✅   |
| Codex       |  ✅    |  ✅      |  ✅    |  —    |

Each agent can delegate tasks to the other three, without leaving its own interface.

## How it integrates

**Claude Code** gets slash commands:
```
/opencode:run refactor the auth module
/gemini:review check this diff for edge cases
/codex:run write tests for the new retry logic
```

**OpenCode** gets MCP tools:
```
delegate_claude("review this migration for data loss risk")
delegate_gemini("analyze this for performance bottlenecks")
delegate_codex("add integration tests")
```

**Gemini CLI** and **Codex** get skills — install once, then just ask them to delegate in natural language.

## The workflow that actually matters

Parallel code review. Ask three different agents to review the same diff independently, each with a different focus:

```text
/gemini:review — correctness and edge cases
/codex:run    — test coverage
/opencode:run — architecture and simplification
```

Different models have genuinely different failure modes. One may miss an edge case another catches. One may overweight architecture where another spots a missing test. You read all three and make the call. The agents provide the raw material; judgment stays with you.

## Install

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode
```

Full installation for Gemini CLI and Codex is in the README.

chorus is not trying to be a new IDE or orchestration platform. It is plumbing between tools developers already use. One install, four agents, zero new workflows forced on you.

**[https://github.com/valpere/chorus](https://github.com/valpere/chorus)**
