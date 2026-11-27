---
layout: portfolio-item
title: "multi-agent-orchestrator — Multi-Agent Orchestration: Planner, Workers, Reviewer & Control Panel"
permalink: /portfolio/multi-agent-orchestrator/
image: /portfolio/assets/images/multi-agent-orchestrator/hero-0900x0530.png
---

## Overview

Putting every instruction, tool and decision into one giant prompt breaks down as soon as a business process spans multiple steps: context fills up, accuracy drifts, and nobody can tell why the agent skipped a check or repeated an action. A multi-agent orchestrator splits complex workflows into specialized roles (**Planner → Worker → Reviewer**) coordinated by a deterministic state machine with shared persistence, isolated sandboxes, human-in-the-loop approval gates and a live control panel tracking every run, decision and token cost.

**Result: complex multi-step engineering, analytics, SEO or operations pipelines execute reliably at scale — with strict quality verification between stages and full human visibility before irreversible actions.**

---

## The Real Hard Part

Connecting multiple LLMs in a loop without deterministic orchestration produces infinite ping-pong debates, conflicting state writes and runaway API bills. The real engineering problem is building the control plane around the agents: explicit state transitions, bounded retry budgets, structured JSON handoff contracts between roles, isolated execution workspaces, and an approval dashboard where an operator can inspect diffs, approve, or intervene in one click.

---

## How It Works

1. **Task decomposition (Planner).** Incoming jobs (tickets, briefs, specs, data batches) enter a persistent queue; the Planner agent decomposes the request into discrete, typed subtasks with acceptance criteria and explicit dependencies.
2. **Parallel execution (Workers).** Specialized Worker agents (research, code/content generation, API integration, QA) pick up tasks in isolated contexts with only the tools and context slices they need, preventing prompt bloat and cross-task contamination.
3. **Independent verification (Reviewer + Deterministic Gates).** Before any output moves forward, a separate Reviewer agent and deterministic validators (schema checks, unit/build tests, rule linters) verify the result against acceptance criteria and reject defective runs with structured feedback.
4. **Human-in-the-loop control panel.** High-impact or external actions pause at an explicit approval gate in a web dashboard (or Telegram), showing full trace logs, diffs, confidence scores and token spend before final execution.

---

## Key Decisions

| Decision | Why |
|---|---|
| Deterministic state machine owning all transitions | Agents propose actions and outputs, but backend code enforces stage order, max iterations and stop conditions, so agent loops always terminate. |
| Typed JSON handoff contracts between roles | Planner, Worker and Reviewer exchange compact structured artifacts instead of forwarding raw 50K-token chat transcripts. |
| Independent Reviewer role + automated checks | A model rarely catches its own mistakes inside the same context window; separating execution from review cuts error rates dramatically. |
| Live control panel with audit trail and cost tracking | Gives managers and engineers full observability over active runs, bottlenecks, rejection reasons and per-task LLM cost. |

---

## What You Get

- Production multi-agent orchestration service (Go, LangGraph or a custom state machine) with PostgreSQL + Redis persistence
- Specialized Planner, Worker and Reviewer agent roles with strict JSON handoff schemas and retry budgets
- Web control panel (and optional Telegram notifications) for live run monitoring, audit logs and human-in-the-loop approval
- Token-cost telemetry, dead-letter recovery and clear documentation for adding new agent roles

---

## Boundaries

- Multi-agent architectures add latency and token overhead; simple single-step tasks (FAQ answers, single API lookups) are better served by a single-agent or deterministic script.
- Irreversible external actions (production deploys, financial transfers, public posts) always stay behind an explicit approval gate unless explicitly whitelisted.

---

## Stack

`Go` · `LangGraph / Custom State Machine` · `PostgreSQL` · `Redis` · `OpenAI / Claude / OpenRouter API` · `MCP / Tool Calling` · `WebSockets` · `Docker`
