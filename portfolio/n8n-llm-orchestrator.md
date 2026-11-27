---
layout: portfolio-item
title: "n8n-llm-orchestrator — Self-Hosted n8n + LLM Business Process Orchestration"
permalink: /portfolio/n8n-llm-orchestrator/
image: /portfolio/assets/images/n8n-llm-orchestrator/hero-0900x0530.png
---

## Overview

Most no-code and n8n/Make.com prototypes work on ten test records and break the moment real traffic arrives: a webhook burst stalls the single-process runner, an LLM timeout drops a paid lead without a trace, or an unbounded retry loop burns through API credits overnight. A production self-hosted n8n + LLM orchestration hub runs in Docker Queue Mode backed by PostgreSQL and Redis — processing webhooks reliably, running structured LLM steps with cost limits, syncing CRM, email, Google Sheets and Telegram, and alerting your team the second any upstream API fails.

**Result: visual workflow speed paired with backend reliability — every failed lead caught and replayable, predictable LLM spend, and full ownership on your own VPS without per-operation SaaS markups.**

---

## The Real Hard Part

Visual workflow tools hide classic distributed-systems failure modes: duplicate webhooks create duplicate CRM deals, rate-limited LLM endpoints abort runs mid-flight, and ad-hoc edits in the UI leave no audit trail when something breaks. The real engineering work is putting deterministic guardrails around the canvas — Redis worker queues, idempotency checks, strict JSON Schema validation for LLM outputs, dead-letter alerting with replay, and Git-backed workflow versioning.

---

## How It Works

1. **Webhook ingress and deduplication.** Events from CRM, email, Telegram, site forms or scheduled triggers hit an Nginx TLS endpoint and pass an idempotency check (`event_id` / payload hash in Redis/PostgreSQL) so retried webhooks never double-fire.
2. **Queue Mode worker execution.** The main n8n instance only accepts triggers and enqueues jobs into Redis; isolated worker containers run heavy LLM, scraping and API nodes in parallel without blocking incoming requests.
3. **Structured LLM steps with guardrails.** Every model call enforces strict JSON output parsing, per-run token budgets and automatic fallback across providers (OpenRouter, OpenAI, Claude, DeepSeek) before writing anything to downstream systems.
4. **Error workflow and one-click replay.** Failed executions route into a dedicated Error Workflow that stores the raw payload, sends a concise Telegram alert with the failing node and execution link, and allows safe replay once the external API recovers.

---

## Key Decisions

| Decision | Why |
|---|---|
| Self-hosted Docker + Queue Mode (Redis + PostgreSQL) | Decouples webhook ingestion from slow LLM calls, eliminates SQLite locking, and removes per-operation SaaS fees at scale. |
| Idempotency keys before every write node | External CRMs and messengers retry webhooks on timeouts; checking a processed-key store prevents duplicate deals, invoices or messages. |
| Strict JSON Schema + token caps on LLM nodes | Prevents malformed model output from corrupting CRM/Sheets fields and stops runaway loops from draining API balances. |
| Dedicated Error Workflow + Git exports | Silent failures kill trust in automation; every crash alerts Telegram immediately and every workflow version is backed up in Git. |

---

## What You Get

- Hardened self-hosted n8n stack on your VPS (Docker Compose, Nginx + SSL, PostgreSQL, Redis Queue Mode, automated backups)
- Production AI workflows connected to your CRM, email, Telegram, Google Sheets/Drive or custom REST APIs
- Structured LLM prompts with JSON validation, fallback models and monthly spend caps
- Error-handling workflow with Telegram alerts, Git backup script and handover runbook for your team

---

## Boundaries

- High-volume scraping behind aggressive anti-bot gates or real-time sub-second streaming belongs in a dedicated Go microservice called by n8n, not inside visual loop nodes.
- Requires a Linux VPS (typically 2–4 vCPU, 4–8 GB RAM) and API keys for your target CRM/LLM providers.

---

## Stack

`n8n (Queue Mode)` · `Docker Compose` · `PostgreSQL` · `Redis` · `Nginx + SSL` · `OpenRouter / OpenAI / Claude API` · `Go` · `CRM & Telegram Webhooks` · `Google Sheets / Drive API`
