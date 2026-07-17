---
layout: portfolio-item
title: "Sales CRM Platform — Conversation-First CRM with AI Reporting & Decision Billing"
permalink: /portfolio/sales-crm-platform/
image: /portfolio/assets/images/sales-crm-platform/sales-crm-en.png
---

## Overview

A modular sales-CRM platform built around conversations rather than static records. A conversation workspace (chat-first, dual-layer status system) sits at the center; AI-powered reporting, lead enrichment, and organizational-intelligence modules build on top of it, all governed by a deterministic, immutable billing ledger for AI-assisted actions.

**Role:** Freelance full-stack engineer / AI integration
**Timeline:** 3 months
**Domain:** Sales CRM / lead management SaaS

Joined an in-flight rebuild and became the primary contributor over the engagement — 1,366 of the repository's 2,888 commits, spanning frontend, backend, and the AI integration layer.

---

## Solution

The platform is organized into independently-versioned modules that share one data model:

- **Talk** — conversation-first CRM workspace with a dual-layer status system and multiple AI assistance modes
- **See** — AI-generated visual reports and financial risk modeling ("living reports" that update as underlying data changes)
- **Decide** — decision-impact tracking and a token-based billing ledger for AI-assisted actions
- **Identity** — organizational structure: roles, positions, computed team intelligence
- **Tenancy** — authentication, data isolation, and privilege-based access control
- **Steam Sync** — lead ingestion from an external telephony/CRM system, including call transcription and agent assignment
- **Lead Intelligence** — automated lead enrichment and scoring via an external workflow-automation layer

---

## Key Technical Decisions

### AI gateway with provider fallback, not hardcoded calls

Every AI code path routes through a single gateway function rather than calling a provider SDK directly. System prompts live in a database table (5-minute TTL cache) so prompt changes don't require a deploy. The gateway calls a primary provider and automatically falls back to a secondary on rate-limiting or provider-side errors — AI-dependent features (analysis, translation, summarization, scoring) keep working through a provider outage instead of failing the whole pipeline.

### Deterministic, immutable billing ledger

AI-assisted actions consume a token-based currency, and every consumption event is written to an append-only ledger — no action ever mutates or overwrites a prior entry. Billing state is always reconstructible by replaying the ledger, which matters both for auditability and for debugging "why does this account show this balance" days after the fact.

### Cron-driven background processing, not request-time work

23 production cron jobs handle sync, monitoring, and email processing outside the request/response cycle — lead synchronization, result-code auto-sync, scheduled reference-data refreshes, queued email delivery. Keeping this work off the request path keeps the conversation workspace responsive regardless of how much background synchronization is happening.

### Trunk-based deployment across two environments

Both staging and production deploy from the same branch (trunk-based since mid-engagement), rather than maintaining a long-lived staging branch that drifts from what's actually shipping. Reduced the class of bugs that only show up because staging and production were quietly running different code.

---

## Results

| Metric | Value |
|---|---|
| Codebase size | ~123K lines (frontend + edge functions) |
| Commits (this engagement) | 1,366 out of 2,888 total |
| Test files | 201 |
| Production cron jobs | 23 |
| Independently-versioned modules | 7 |
| AI providers (gateway fallback) | 2 (primary + fallback), plus a separate enrichment/scoring stack |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| State / data | TanStack React Query v5, React Router v7 |
| Backend | Supabase (PostgreSQL, RLS, Edge Functions) |
| AI / LLM | Google Gemini (primary), OpenRouter (fallback), separate enrichment/scoring providers |
| Automation | n8n (lead enrichment workflows) |
| Infra | VPS + Nginx + Let's Encrypt, trunk-based deploy to staging + production |
