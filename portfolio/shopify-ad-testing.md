---
layout: portfolio-item
title: "AI Ad-Testing Loop — Shopify Luxury Fashion"
permalink: /portfolio/shopify-ad-testing/
image: /portfolio/assets/images/shopify-ad-testing/hero-0900x0530.png
---

## Overview

Building an AI ad-testing loop for a Shopify store selling limited-run, one-off luxury fashion. The loop closes end-to-end: Shopify product/order/inventory data → Claude generates offer/angle/hook hypotheses → Higgsfield renders creatives → the system assembles Meta ad campaigns, created paused with hard spend caps → performance reconciles against real Shopify orders, not the ad platform's own pixel → winners get scored and spawn new variations.

**Status: Stage 1 of a 3-stage engagement, in progress since September 2026.** Stage 1 delivers the full pipeline through Claude/Higgsfield generation, the inventory and spend guardrails, and a Google Sheets review surface. Meta campaign assembly, metrics collection, and automated win/loss scoring land in Stage 2.

---

## Architecture

```
Shopify Admin API (products/orders/inventory) ──▶ internal/shopify
Shopify webhooks (live, 6 topics)             ──▶ internal/webhooks   HMAC + dedup
Claude API          ◀──▶ internal/claude       offer / angle / hook, schema-validated
Higgsfield          ◀──▶ internal/higgsfield   async creative jobs, vendor-neutral
Meta Marketing API  ◀──▶ internal/meta         campaign/adset/ad — always PAUSED (S2)
                              │
                    internal/store (PostgreSQL)
        Product → Variant → Offer → Angle → Hook → Creative → Link → MetaPlacement
                              │
        ┌─────────────────────┼──────────────────┬─────────────────┐
        ▼                     ▼                  ▼                 ▼
  internal/guard        internal/recon      internal/score    internal/sheets
  inventory + spend      real orders vs.     early-signal →     one-way review
  guardrails             Meta claims          CPA/ROAS verdict   sync
```

One Go monolith, one PostgreSQL database, one in-process scheduler (`robfig/cron`). No message broker, no Kubernetes, no microservices — the actual load is low-rate API orchestration (dozens of Shopify orders a month, a handful of creatives per test cycle), and all heavy compute runs remotely (Claude, Higgsfield). Every external call — Shopify, Claude, Higgsfield, Meta — goes through its own bounded queue with a leased claim and exponential-backoff retry, so one API having a bad day never stalls the others.

---

## Key Design Decisions

| Decision | Why |
|---|---|
| Reconcile against real Shopify orders, not the Meta pixel | UTM + order timestamp + variant GID + allocated line amount; unattributed orders (POS, direct) go to a separate bucket instead of being force-matched |
| Early-signal scoring before CPA/ROAS | Store AOV is modest — purchases per creative are genuinely few. Hold rate, outbound CTR, and cost-per-ATC decide first; CPA/ROAS only kicks in past a configurable event threshold |
| Per-variant inventory guard, not a blanket "everything is 1-of-1" rule | The catalog mixes true one-off pieces with normally-stocked lines — a naive single-unit assumption would misfire on the latter |
| Higgsfield behind a vendor-neutral `Provider` interface | `Submit`/`Poll` contract only — a second creative vendor becomes a new implementation and a config flag, not a rewrite of the queue, schema, or callers |
| Append-only event log for links and creatives | `LinkEvent`/`CreativeEvent`; the current status/verdict is a projection written in the same transaction, so the full decision history survives every state change |
| Ads always created PAUSED | Nothing spends until the client activates it — spend control is a client-facing guarantee built into the assembly step itself, not a policy layered on top |

---

## Spend Control

A client-facing guarantee, enforced at three independent layers:

1. **Every new ad is created PAUSED.** Nothing spends until the client activates it manually.
2. **Per-ad daily cap + a monthly ceiling, enforced in-system.** Past the ceiling, no new campaigns are created.
3. **The client's own Meta account-level spending limit** — a hard stop Meta enforces regardless of what this system does.

---

## Deployment

Delivered as source plus a two-service `docker-compose` stack, running on the client's own VPS (not a shared account) with the system's own subdomain, Caddy for automatic TLS, and a nightly `pg_dump` plus an off-box disk-level backup. Development uses a Meta test ad account under the client's Business Manager — real campaign objects, zero live spend, until acceptance.

---

## Stack

`Go` · `PostgreSQL` · `Shopify GraphQL Admin API` · `Claude API` · `Higgsfield` · `Meta Marketing API` · `robfig/cron` · `Docker Compose` · `Caddy`
