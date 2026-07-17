---
layout: portfolio-item
title: "Gym Operations Platform — Shift & Task Management with AI Photo Validation"
permalink: /portfolio/gym-ops-platform/
image: /portfolio/assets/images/gym-ops-platform/gym-ops-en.png
---

## Overview

A shift-and-task operations platform for gym-cleaning teams. Managers schedule shifts across multiple brands and locations and review task photos; cleaners run their shift through a mobile-first, chat-style interface, submitting photo evidence for every task. AI validates the photos, flags anomalies, and generates shift summaries for managers.

**Role:** Freelance full-stack engineer / AI integration
**Timeline:** 3 months, solo
**Domain:** Field-services operations SaaS

The platform started life as a no-code MVP. I took over an existing, partially-built codebase and substantially rebuilt it into a production-grade system — 991 commits over three months, spanning the React/TypeScript frontend, the Supabase/Deno backend, and the AI integration layer end to end.

---

## Solution

Two very different UX targets share one data model:

- **Admin / Manager** — desktop-first, sidebar navigation. Schedule shifts, review task photos, monitor live shift status across gyms and brands, read AI-generated reports.
- **Cleaner** — mobile-first, full-screen conversational workflow. Claim a shift, work through assigned tasks one at a time, submit a photo per task, get instant AI feedback.

Every task photo goes through automated AI validation before a manager ever sees it — catching obviously wrong or missing work early, so managers spend review time on judgment calls, not on screening.

---

## Key Technical Decisions

### Automated escalation, not manual monitoring

Three trigger types run continuously and notify managers the moment something needs attention, instead of relying on someone noticing a stalled shift:

| Trigger | Condition | Action |
|---|---|---|
| No check-in | 10 min → 30 min staged escalation | Cleaner nudged, then manager notified |
| Photo rejected | Same task rejected twice | Manager notified, shift flagged |
| Overdue shift | 30+ min past scheduled end | Manager notified, shift flagged |

### Multi-provider LLM failover

Photo validation and report generation run through a primary/fallback LLM chain across five providers. If the primary provider degrades or rate-limits, the system fails over automatically — AI validation keeps working through provider outages instead of blocking the cleaner's workflow.

### Three-Layer data model

Facts → Computation → Interpretation, enforced at the schema level. Raw operational data (shifts, task submissions) is immutable once recorded; computed/derived state lives in its own layer; AI-generated interpretation (assessments, summaries) is append-only and never overwrites the facts it was derived from. Row-level security gates every table on this model, scoped to brand and role.

### AI-agent development workflow

Given the scope of the rebuild (270+ files, no existing test baseline to lean on), development ran through a structured multi-agent pipeline rather than ad hoc prompting: a planning pass produces a spec, a tech-lead pass turns it into an implementation plan, generation and simplification passes produce and clean up the code, and independent code-review, security-review, and test-generation passes run before anything merges. This kept a solo, fast-moving rebuild from accumulating the kind of undocumented tribal knowledge that a from-scratch AI-assisted rewrite usually produces.

---

## Results

| Metric | Value |
|---|---|
| Codebase size | ~42K lines across 270+ files |
| Commits (this engagement) | 991 over 3 months |
| Tests | 474 passing, 52 test files |
| Test-to-source ratio | 30% |
| `npm audit` vulnerabilities | 0 |
| Escalation trigger types | 3, fully automated |
| LLM providers (failover chain) | 5 |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5, Vite, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Row-Level Security) |
| Edge functions | Deno |
| AI / LLM | Multi-provider failover chain (5 providers) |
| Monitoring | Sentry |
| Testing | Vitest (unit), Playwright (E2E) |
| CI/CD | GitHub Actions |
| Infra | VPS + Nginx + Let's Encrypt |
