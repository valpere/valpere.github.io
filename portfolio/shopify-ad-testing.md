---
layout: portfolio-item
title: "AI Ad Campaign System — Shopify Luxury Fashion"
permalink: /portfolio/shopify-ad-testing/
image: /portfolio/assets/images/shopify-ad-testing/hero-0900x0530.png
---

## Overview

An AI system that creates, tests and runs ad campaigns for a Shopify luxury-fashion store — end to end, from the store's own data to a verdict on every ad. It reads products, prices, photos, inventory and orders from Shopify; has Claude turn them into offer, angle and hook hypotheses; produces video creatives from a brief agreed in a chat; assembles Meta campaigns, always created paused; then collects the results, reconciles them against real Shopify orders, and marks winners and losers so the next round starts from what worked.

The store itself stays untouched: no theme or app code inside it. The system reads from Shopify and writes to Meta, under hard spend limits.

**The operator surface is a chat.** The client asks "how much did we spend this week", agrees a creative brief, watches a preview, approves the final video and confirms the campaign. Everything that moves money or changes an ad is a proposal the client confirms — never something the model does on its own.

---

## Six stages, accepted one at a time

| Stage | Scope | Status |
|---|---|---|
| 1. Foundation | Shopify sync, hypothesis generation, creative rendering, spend guards, a review sheet | Accepted |
| 2. Product | The chat; briefs, preview and final renders with montage; Meta assembly and Insights; reconciliation and scoring; guards on live ads; a client guide | Built, all gates passed; in acceptance |
| 3. Full automation | Auto-pause of losers, scaling of winners, variations generated from winners, hypothesis analytics | Planned |
| 4. Voice and mobile | A voice and mobile interface | Planned |
| 5–6 | Scoped when the preceding stage is accepted | Planned |

---

## How a campaign gets made

1. **Sync.** Products, variants, inventory and orders from the Shopify GraphQL Admin API, plus live webhooks (HMAC-verified, deduplicated).
2. **Hypotheses.** Claude produces offers, angles and hooks as schema-validated structured output, grounded in the history of earlier tests.
3. **Brief.** The chat interviews the operator until the brief is complete — product, persona, shots, script, camera style. Every revision is a new version.
4. **Preview.** A cheap 720p render. Its cost is estimated before it runs and the number of iterations is capped. The operator approves or revises.
5. **Final.** The 1080p render, then an ffmpeg montage: cutaways, camera moves, captions burned in word by word. whisper.cpp transcribes the result and checks that the video says the approved script.
6. **Campaign.** Created from the approved video: campaign → ad set → creative → ad, all paused, the spend cap set in the payload.
7. **Measure.** Meta Insights on a schedule, kept as cumulative snapshots with stale detection.
8. **Reconcile.** Each order line is matched to an ad through UTM, order time, variant and allocated amount. Orders that can't be attributed (POS, direct) stay in their own bucket instead of being forced onto an ad.
9. **Verdict.** Early signals first (hold rate, outbound CTR, cost per add-to-cart), ROAS once enough events have accumulated. Winners and losers become context for the next round of hypotheses.

---

## Architecture

```
Shopify Admin API ──▶ internal/shopify     products · variants · inventory · orders
Shopify webhooks  ──▶ internal/webhooks    HMAC + dedup, then enqueue
Claude API       ◀──▶ internal/claude      hypotheses, schema-validated
Claude API       ◀──▶ internal/chat        the chat: closed tool registry, proposals
                      internal/brief       versioned briefs, render tiers, approval gates
Higgsfield       ◀──▶ internal/higgsfield  async image/video jobs, vendor-neutral
                      internal/montage     ffmpeg composition, whisper.cpp captions
Meta Marketing   ◀──▶ internal/meta        campaign / ad set / ad — always PAUSED
Meta Insights     ──▶ internal/insights    metric snapshots
                              │
                    internal/store (PostgreSQL)
  Product → Variant → Offer → Angle → Hook → Hypothesis → Creative → Link → Placement → Metrics
                              │
        ┌─────────────────────┼──────────────────┬─────────────────┐
        ▼                     ▼                  ▼                 ▼
  internal/guard        internal/recon      internal/score    internal/sheets
  inventory + spend     real orders vs.     early signal →    one-way review
  guardrails            Meta's claims       ROAS verdict      sync
```

One Go binary, one PostgreSQL database (18 migrations), one in-process scheduler (`robfig/cron`). No message broker, no Kubernetes, no microservices — the real load is low-rate API orchestration (dozens of Shopify orders a month, a handful of creatives per cycle), and the heavy compute runs remotely (Claude, Higgsfield). The one exception is the montage, which runs on the 2-vCPU server itself: a 12-second video composes in about 30 seconds. Every external call goes through its own bounded queue with a leased claim and exponential-backoff retry, so one API having a bad day never stalls the others.

---

## Key Design Decisions

| Decision | Why |
|---|---|
| A chat that can only propose | The tool registry is closed — no shell, no files, no web. Tools that change anything (pause an ad, set a limit, create a campaign, approve a render) only create a proposal; its summary and worst-case figure are rendered by Go code, not by the model, and `Confirm` has a single caller, enforced by an AST test |
| Reconcile against real Shopify orders, not the Meta pixel | UTM + order timestamp + variant GID + allocated line amount; unattributed orders go to a separate bucket instead of being force-matched |
| Verdict by ROAS, not by a derived CPA ceiling | A CPA ceiling derived from average order value marked profitable high-ticket ads as losers: three $500 sales on $400 of spend is ROAS 3.75 but CPA $133. The verdict is ROAS-only; CPA stays as information |
| Early-signal scoring before ROAS | Average order value is modest, so purchases per creative are genuinely few. Hold rate, outbound CTR and cost per add-to-cart decide first; ROAS takes over past a configurable event threshold, with no code change |
| Inventory guard per variant, on the crossing | The catalog mixes one-off pieces with normally stocked lines. The guard watches each variant and fires when its quantity crosses from positive to zero — including an oversell or a bulk order that jumps past exactly 0 |
| A render is a graph, not a call | A tier can start from a generated frame; a coordinator submits the dependent jobs in order and reconciles stragglers, so a failed first frame is retried instead of failing the whole render |
| Cost-driven creative tiers behind a `Provider` interface | Higgsfield sits behind a narrow `Submit`/`Poll` contract. After Seedance finals cost $14–23 and garbled the lettering on a watch dial when a hand neared the lens, the final tier moved to PixVerse 1080p at about $1.64 — a config change, not a rewrite |
| Ads always created paused; the test ends when the ad goes live | The system sets the end time the first time it sees an ad active, so the client can keep a campaign paused for as long as they like |
| Append-only event log for ads and creatives | The current status or verdict is a projection written in the same transaction, so the full decision history survives every state change |
| The word "test" is never used bare | It had meant four things (an ad test, the cheap preview video, automated tests, a vendor sandbox). The chat prompt, tool descriptions, the page and the proposal summaries are scanned by a Go test for the bare word |

---

## Spend Control

A client-facing guarantee, enforced at four independent layers:

1. **Every new ad is created paused.** Nothing spends until the client activates it.
2. **Per-ad daily cap and a monthly ceiling, enforced in the system** on live objects. Past the ceiling no new campaigns are created, and lowering a cap or ceiling runs the guard at once.
3. **Every paid render shows its estimate before it runs**, iterations are capped, and the price is part of the confirmation card.
4. **The client's own Meta account-level spending limit** — a hard stop Meta enforces regardless of what this system does.

---

## Built to be verified

- **Spec first.** 85 requirements, each traced to a functional, logic or physical requirement and measured with [Tumanomir](/portfolio/tumanomir/) — `K_drift` 0.00, nothing untraced.
- **Tests outweigh the code.** About 21,500 lines of production Go against about 25,700 lines of tests in 139 test files, run with `-race`; `golangci-lint` reports 0 issues.
- **Every milestone ends with a review of its diff** by [fix-review](/portfolio/fix-review/). A multi-agent review of the Stage 2 specification found issues that were checked against the code and fixed; findings that did not hold up were rejected.
- **303 commits in the first month**, from the first scaffold to the Stage 2 gates.

---

## Deployment

Delivered as source plus a `docker-compose` stack running on the client's own VPS, behind Caddy with automatic TLS, with a nightly `pg_dump` and a disk-level backup. The chat has its own subdomain, sign-in with argon2id, server-side sessions, CSRF protection and a strict CSP. Each stage's acceptance includes an updated client guide — screenshots and diagrams, as PDF and docx — and a five-minute acceptance path for the client. Development ran on a dedicated ad account under the client's Business Manager: real campaign objects, all paused, no live spend until the client switches an ad on.

---

## Stack

`Go` · `PostgreSQL` · `Shopify GraphQL Admin API` · `Claude API` (tool use, structured output) · `Higgsfield` · `Meta Marketing API` · `Meta Insights` · `ffmpeg` · `whisper.cpp` · `Google Sheets API` · `robfig/cron` · `Docker Compose` · `Caddy`
