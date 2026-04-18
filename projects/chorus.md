---
layout: project
title: "chorus — cross-agent plugin mesh"
permalink: /projects/chorus/
lang: en
---

![chorus — cross-agent plugin mesh](/projects/assets/images/chorus/infographic-0900x0530.png)

Most AI coding tools are designed like islands.

You pick one — Claude Code, OpenCode, Gemini CLI, or Codex — and stay inside its workflow. A second opinion means copying context, switching terminals, re-explaining the task, waiting, comparing answers, and manually carrying the result back.

**chorus** removes that step.

## What It Does

chorus is an open-source plugin collection that creates a **4×3 delegation mesh** between four AI coding CLIs:

| From \ To   | Claude | OpenCode | Gemini | Codex |
|-------------|--------|----------|--------|-------|
| Claude Code |   —    |  ✅      |  ✅    |  ✅   |
| OpenCode    |  ✅    |  —       |  ✅    |  ✅   |
| Gemini CLI  |  ✅    |  ✅      |  —     |  ✅   |
| Codex       |  ✅    |  ✅      |  ✅    |  —    |

Each agent can delegate tasks to the other three, without leaving its own interface.

## Integration

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

**Gemini CLI** and **Codex** get skills — install once, then ask in natural language.

## Parallel Code Review

Ask three different agents to review the same diff independently, each with a different focus:

```text
/gemini:review — correctness and edge cases
/codex:run    — test coverage
/opencode:run — architecture and simplification
```

Different models have genuinely different failure modes. One may miss an edge case another catches. chorus provides the raw material; judgment stays with you.

## Named Workflow Commands

| Command | What it does |
|---|---|
| `/chorus:review` | Parallel review of `git diff HEAD` — one command, 3 independent opinions |
| `/chorus:council` | Same task to all 3 agents with different roles; host synthesizes |
| `/chorus:debug` | Ranked root-cause hypotheses from 3 agents for a bug symptom |
| `/chorus:second-opinion` | Quick independent check from one chosen agent |

OpenCode gets these as MCP tools: `council`, `parallel_review`, `parallel_debug`, `second_opinion`. Gemini CLI and Codex get them as skills.

## Install

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode
```

Full installation for Gemini CLI and Codex is in the [README](https://github.com/valpere/chorus).

chorus is not trying to be a new IDE or orchestration platform. It is plumbing between tools developers already use. One install, four agents, zero new workflows forced on you.
