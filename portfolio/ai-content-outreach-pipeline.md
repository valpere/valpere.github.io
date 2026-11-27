---
layout: portfolio-item
title: "ai-content-outreach-pipeline — AI Content & B2B Outreach Pipeline with Deterministic Fact-Checking"
permalink: /portfolio/ai-content-outreach-pipeline/
image: /portfolio/assets/images/ai-content-outreach-pipeline/hero-0900x0530.png
---

## Overview

Raw LLM "content factories" and automated outreach scripts quickly damage a brand: they invent product specs, repeat generic AI clichés, break HTML/JSON templates, or blast identical messages that land straight in spam folders. A production **AI Content & B2B Outreach Pipeline** combines structured data ingestion, multi-step generation (brief → draft → deterministic fact-check & brand-voice validator), and controlled delivery to your CMS, e-commerce catalog, Google Sheets, CRM or email/social channels — keeping human editors in charge of final approval where needed.

**Result: high-volume product descriptions, SEO pages, social drafts and personalized B2B outreach generated from verified source data — with every fact checked against the source, consistent brand tone and clean CRM/CMS sync.**

---

## The Real Hard Part

Generating 500 product cards or personalized outreach emails in a loop is trivial; preventing 5% of them from containing hallucinated prices, non-existent features, broken links or robotic tone is the real challenge. Relying on a single prompt ("be accurate and sound natural") fails at scale. The engineering solution is separating generation from verification: strict JSON Schema outputs, a deterministic fact-checker that cross-verifies every number, SKU and URL against the source record, and a staging queue with automated quality scoring before anything publishes.

---

## How It Works

1. **Source ingestion and enrichment.** Structured inputs (supplier feeds, catalog SKUs, Google Sheets, CRM leads, company websites or RSS/news briefs) are normalized, deduplicated and stored in PostgreSQL/Sheets as the single source of truth.
2. **Templated LLM generation.** Worker jobs (Go or n8n Queue Mode) generate structured drafts (titles, meta tags, product copy, social posts or personalized B2B outreach sequences) using strict JSON Schemas and per-niche brand-voice guidelines.
3. **Deterministic fact-checking and guardrails.** Every generated artifact passes automated checks: verifying numbers, SKUs, prices and URLs against the input record, enforcing length/formatting rules, blocking banned clichés/hallucinations, and retrying failed items with explicit error feedback.
4. **Controlled publishing and CRM sync.** Validated items route to a staging table/Telegram review queue (or auto-publish when all checks pass) and push cleanly into WordPress/OpenCart/Shopify, Google Sheets, CRM or outreach tools with full status tracking.

---

## Key Decisions

| Decision | Why |
|---|---|
| Source-grounded generation + deterministic fact-checker | Every price, dimension, SKU or company fact is cross-checked in code against the input record before publishing — eliminating hallucinated claims. |
| Strict JSON Schema output per channel | Guarantees clean separation of `title`, `meta_description`, `body`, `cta` and tags with zero broken markup when importing into CMS or CRM. |
| Automated anti-cliché & formatting validator | Catches repetitive AI phrasing, missing required fields and broken links automatically so editors only review clean candidates. |
| Rate-limited batch queues with cost caps | Processes hundreds or thousands of items asynchronously without hitting API rate limits or burning through LLM budgets on retries. |

---

## What You Get

- End-to-end automated pipeline (Go + n8n/Docker) connecting your source data (Sheets, feeds, CRM) to LLM generation and publishing targets
- Deterministic fact-checking, JSON Schema validation and brand-voice quality gates
- Optional human-in-the-loop review workflow (Google Sheets status column or Telegram approval) before live publishing
- Cost/throughput telemetry, retry handling and clear configuration for adding new templates or languages

---

## Boundaries

- Does not bypass anti-spam regulations, scrape gated personal contacts without lawful sources, or automate bulk spam blasts; B2B outreach pipelines operate on verified, permission-compliant lead lists with proper sending limits.
- Requires structured source data (catalog feed, brief table or CRM records) to ground factual claims.

---

## Stack

`Go` · `n8n (Queue Mode)` · `OpenAI / Claude / OpenRouter API` · `JSON Schema` · `PostgreSQL` · `Redis` · `Google Sheets / Drive API` · `WordPress / OpenCart / Shopify / CRM APIs` · `Docker`
