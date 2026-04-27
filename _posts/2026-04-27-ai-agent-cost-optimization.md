---
layout: post
title: "Cutting AI Agent Costs 70–85% with a Hybrid Sonnet → Haiku + OpenRouter Architecture"
date: 2026-04-27
permalink: /blog/2026/04/27/ai-agent-cost-optimization/
category: ai-practice
tags: [AI, cost-optimization, claude-code, subagents, openrouter, haiku, sonnet]
lang: en
description: "How we cut subagent spend 70–85% by replacing blanket Sonnet 4.6 usage with a four-pattern hybrid: direct OpenRouter for analytical tasks, Haiku as orchestrator, CLI workers for file-IO loops, and Sonnet only for high-blast-radius agents."
excerpt: "Our platform runs 11 AI subagents to automate development workflows. All defaulted to Claude Sonnet 4.6. That became our biggest AI cost line — and most of it was unnecessary."
image: /assets/images/posts/ai-agent-cost-optimization/ai-agent-cost-optimization.png
---

![Hybrid AI agent cost optimization architecture](/assets/images/posts/ai-agent-cost-optimization/ai-agent-cost-optimization.png)

Our platform runs 11 AI subagents to automate development workflows — code review, test generation, security analysis, and documentation. All defaulted to **Claude Sonnet 4.6** at $3/$15 per 1M tokens. That became our biggest AI cost line, and most of it was unnecessary.

This post describes the hybrid architecture we designed to fix it.

## The problem

Subagents like `code-simplifier`, `docs-maintainer`, and `pm-issue-writer` perform small, structured prose tasks. They receive a diff or a lint report, produce a structured text output, and stop. Running them on Sonnet is like using a staff engineer to fill out a form.

Meanwhile, `code-generator` spent Sonnet tokens on file I/O loops that a CLI tool backed by OpenRouter can handle at 10× lower cost.

The `OPENROUTER_API_KEY` in our `.env.local` is a paid key. No free-tier rate limits. That unlocked the migration.

## Provider inventory

Verified prices as of 2026-04-22:

| Model | $/1M in | $/1M out | Best for |
|---|---:|---:|---|
| `deepseek/deepseek-v3.2` | 0.26 | 0.38 | Code generation, refactor |
| `qwen/qwen3-coder-next` | 0.15 | 0.80 | TypeScript, test generation |
| `x-ai/grok-4.1-fast` | 0.20 | 0.50 | Fast parallel review |
| `google/gemini-2.5-flash` | 0.075 | 0.30 | Docs, ADRs, prose |
| `google/gemini-2.5-flash-lite` | 0.037 | 0.15 | Lint classification, small calls |
| Claude Haiku 4.5 | 1.00 | 5.00 | Orchestration, validation gates |
| Claude Sonnet 4.6 | 3.00 | 15.00 | High-blast-radius tasks only |

## Four patterns

### Pattern A — Skill replaces subagent

For pure analytical tasks whose input is a small artifact (diff, lint output) and whose output is a structured blob (report, suggestion list).

```
parent Claude → Skill (thin bash) → rest_post to OpenRouter → output
```

No agentic loop, no Sonnet at all. The `/fix-review` skill already does this — three OpenRouter model rounds, one Sonnet Arbiter. `code-simplifier` is the first to migrate via Pattern A.

### Pattern B — Haiku orchestrator + OpenRouter worker

For agents that need a validation gate: generate output with a cheap model, then have Haiku verify shape or run tests.

```
Haiku subagent
  → OpenRouter model generates candidate
  → Haiku validates + runs verifier
  → success: commit | failure: retry
```

Applies to `test-generator`, `docs-maintainer`, `pm-issue-writer`, `security-reviewer`, `static-analysis`.

### Pattern C — Haiku orchestrator + CLI worker

When the task requires real file I/O and iterative tool use (multi-file edits, build loops), delegate to a CLI with a built-in tool-use loop.

```
Haiku subagent
  → codex exec / opencode run (via openrouter/deepseek-v3.2)
  → Haiku reviews diff + lint + test output before commit
```

Applies to `code-generator`. We already validated this pattern during a session where Claude's subagent quota was exhausted — five PRs shipped cleanly via `codex exec`.

### Pattern D — Keep Sonnet

For agents where project-specific conventions matter more than cost, and where mistakes are high-blast-radius.

**Stays on Sonnet:** `bug-fixer`, `migration-generator`, `project-devops`.

## Decision matrix

| Agent | Pattern | Primary model |
|---|---|---|
| `code-generator` | C | `openrouter/deepseek/deepseek-v3.2` via `codex exec` |
| `test-generator` | B | `openrouter/qwen/qwen3-coder-next` |
| `code-simplifier` | A | `openrouter/deepseek/deepseek-v3.2` |
| `security-reviewer` | B | `chorus review` (3 OR models parallel) |
| `static-analysis` | B | `openrouter/google/gemini-2.5-flash-lite` |
| `docs-maintainer` | B | `openrouter/google/gemini-2.5-flash` |
| `pm-issue-writer` | B | `openrouter/google/gemini-2.5-flash` |
| `ci-build-agent` | B (Haiku-only) | Haiku 4.5 |
| `bug-fixer` | D | **Sonnet 4.6** |
| `migration-generator` | D | **Sonnet 4.6** |
| `project-devops` | D | **Sonnet 4.6** |

## Migration order

1. `code-simplifier` → Pattern A. Smallest scope, baseline measurement.
2. `static-analysis` → Pattern B.
3. `docs-maintainer` → Pattern B. Prose on Gemini Flash.
4. `pm-issue-writer` → Pattern B.
5. `security-reviewer` → Pattern B wrapped around existing `chorus review`.
6. `test-generator` → Pattern B with test execution loop.
7. `code-generator` → Pattern C. Largest, highest-risk.
8. `ci-build-agent` → Pattern B (Haiku-only).

Each step ships as its own PR, followed by 3–5 real-task invocations before rolling to the next agent. Stop condition: success rate drops >10% vs Sonnet baseline.

## Risks worth knowing

**Haiku has lower context awareness.** Prompts must inline the most relevant conventions rather than assume the agent knows the codebase. For each migration, expand the system prompt to include the exact rules the agent needs.

**OpenRouter model drift.** Pin model strings explicitly. A model ID that works today may swap its back-end next week.

**CLI sandboxing.** `codex exec` needed `-s danger-full-access` on this host (bubblewrap failure). Each CLI migration needs a smoke test.

**Free vs paid confusion.** Free `:free` tiers have silent rate limits. Always use paid `openrouter/*` model IDs.

**Don't delete Sonnet agent definitions on rollback.** If a migrated agent regresses, keep the Sonnet definition in place for downstream callers and revert the model assignment only.

## Expected outcome

8 of 11 subagents on Haiku + OpenRouter delegate. 3 agents remain on Sonnet. Target: **70–85% reduction** in subagent spend with equivalent quality on analytical tasks and gated quality on generative ones — measured over a rolling 7-day window.

**[Source and full spec on GitHub](https://github.com/valpere)**
