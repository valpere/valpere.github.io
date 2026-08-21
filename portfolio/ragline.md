---
layout: portfolio-item
title: "ragline — AI/RAG Telegram Support-Bot Backend"
permalink: /portfolio/ragline/
image: /portfolio/assets/images/ragline/ragline-en.png
---

## Overview

Independent demo project: a Go REST API for AI support bots — a knowledge base, Postgres full-text search retrieval, and an explicit confidence gate that hands off to a human instead of guessing. Models the pattern behind AI support bots: a client's own documentation gets searched, and the bot has to know the difference between "I found the answer" and "I found nothing relevant" — the case a naive bot papers over with a plausible-sounding guess.

**Result: a bot that never repeats a low-confidence guess even from its own cache, and never serves a cached answer after the source document it was grounded in has been edited — proven live against 4 real scenarios, not asserted.**

---

## The actual hard problem

A RAG bot's real failure mode isn't "wrong answer" — it's "confident wrong answer." Retrieval always returns *something* if unconstrained; the question is whether the bot knows when that something isn't good enough to answer from. Separately, once an answer is cached for speed, an edited source document has to invalidate it.

---

## Architecture

![ragline decision flow: search, then escalate, cache, or generate](/portfolio/assets/images/ragline/ragline-en.png)

Every question runs through one orchestration: full-text search the knowledge base → look up a cache entry gated on the top match's *current* document version → a pure `Decide` function → escalate, serve the cache, or generate-and-cache a fresh answer — logging the query either way.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| `Decide(hasMatch, topScore, threshold, cacheHit)` extracted as a pure function | No I/O, fully unit tested — a low score escalates *even if* a cache entry exists for that query, so the bot can never keep repeating one bad guess forever |
| Answer cache keyed on `(query_text_hash, document_id, document_version)` | An edit bumps `version`; the next identical question misses the stale cache row and regenerates against the new content, instead of silently serving deleted information |
| OR-combined, `'english'`-config `tsquery` instead of `websearch_to_tsquery`'s default AND | Found live, not designed upfront: an AND query failed on any real question containing words absent from the target document (nearly all of them); an early OR-over-`'simple'` fix let irrelevant questions outrank relevant ones on shared stopwords alone — `'english'`'s built-in stopword removal + stemming fixed both |
| Generation behind a pluggable `Generator` interface | `TemplateGenerator` (default, zero I/O, extractive) needs no external service; an optional `OllamaGenerator` (real local LLM) swaps in via `OLLAMA_URL` without touching the escalation/caching decision at all — same separation as tumanomir's pluggable `Generator` |

---

## Results

- **Full REST API**: JWT auth, knowledge-base CRUD (`PUT` bumps version), a shared-secret `POST /api/ask` (machine-to-machine, not a staff action), a staff escalation queue
- **The escalate/generate/cache decision is pure and fully unit tested** — including the "cache hit but low confidence still escalates" case — with no database required to run `go test ./...`
- **Verified end-to-end** via `docker compose up` against a single seeded "Billing FAQ" document:
  - A relevant question matched and generated an answer (score `0.2`)
  - The identical question, different case, hit the cache instead of regenerating
  - An unrelated question ("airspeed velocity of an unladen swallow") matched nothing and escalated — the exact case the retrieval fix above was needed for; before it, this question scored *higher* than the real billing question on shared stopwords alone
  - After editing the document (`version` 1 → 2), the identical billing question regenerated instead of serving the stale cache, then correctly cache-hit on a third identical question

Code: [github.com/valpere/ragline](https://github.com/valpere/ragline)

---

## Stack

`Go` · `chi` (router) · `pgx/v5` (no ORM) · `golang-jwt` · `bcrypt` · `PostgreSQL` (full-text search: `tsvector`, `ts_rank_cd`, `english` config) · `Docker Compose` · `testify` · optional: `Ollama` (local LLM, pluggable)
