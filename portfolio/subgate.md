---
layout: portfolio-item
title: "subgate — Telegram Paid-Channel-Access Backend"
permalink: /portfolio/subgate/
image: /portfolio/assets/images/subgate/subgate-en.png
---

## Overview

Independent demo project: a Go REST API for Telegram paid-channel access — subscribers, gated channels, idempotent payment-webhook ingestion, and a membership state machine (`active → grace → expired`). Models the pattern behind paid-access Telegram bots: a payment gateway calls back on success, and the backend has to turn that callback into "grant/extend channel access" exactly once, even when the gateway retries and a scheduled expiry check fires at the same moment.

**Result: exactly-once payment processing under both a redelivered webhook and a concurrent expiry sweep — the real failure modes of gateway callbacks and cron-driven downgrades, not hypothetical ones — proven live against 10 concurrent identical webhook deliveries and 5 concurrent renewals racing 5 concurrent sweeps.**

---

## The actual hard problem

Payment gateways redeliver "payment succeeded" notifications — a timeout on the gateway's side after the server already processed and 200'd the first delivery triggers a retry. Naive handling extends a subscription, or grants channel access, once per *delivery* instead of once per *payment*. Separately, a scheduled expiry sweep and a just-landed renewal can race for the same membership: the sweep must never downgrade access that was correctly renewed moments earlier.

---

## Architecture

![subgate domain: subscriber + channel feed membership, payment webhook and sweep both write it under the same lock](/portfolio/assets/images/subgate/subgate-en.png)

Every webhook delivery runs through one transaction: acquire the `(subscriber_id, channel_id)` advisory lock → insert-or-ignore the payment → look up the channel's billing period → upsert the membership, extending `expires_at` from whichever is later, its current value or the payment date → commit. The expiry sweep takes the *same* lock per membership before re-reading and downgrading, which is what actually closes the race against a renewal in flight.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| `payments.UNIQUE(gateway, external_payment_id)` + `ON CONFLICT DO NOTHING` | A redelivered webhook is absorbed at the database level — no duplicate payment row, no double-extended subscription |
| `pg_advisory_xact_lock(subscriber_id, channel_id)` — Postgres's native two-key overload, not a hashed single key | Every payment-renewal and every sweep decision for the same membership is serialized; a sweep that reaches a membership mid-renewal blocks on the lock and re-reads fresh state once it acquires it, instead of racing a stale read |
| `NextSweepStatus` extracted as a pure function of current status, `expires_at`, `now`, and grace days | No I/O, fully unit tested — active→grace→expired only ever moves forward; a payment is the only thing that resets it to active, and `expired` is a documented terminal state the sweep can never resurrect from |
| Sweep exposed as an authenticated endpoint, not wired to an actual cron | Keeps the demo self-contained — the downgrade behavior is triggered and verified without a scheduler dependency, same reasoning as exposing a webhook endpoint instead of requiring a real payment gateway account |
| Webhook signed per-payload (HMAC-SHA256 over the order reference + amount + timestamp), not a static shared-secret header | Mirrors how a real gateway (WayForPay, chosen over Stripe — it shows up roughly 3x more often across the demand data this project is grounded in) actually signs callbacks, and means a tampered amount invalidates the signature |

---

## Results

- **Full REST API**: JWT auth, subscriber/channel/membership CRUD, a signed `POST /api/webhook/payment` (machine-to-machine, not a staff action)
- **The downgrade decision is pure and fully unit tested** — including the terminal-state and zero-grace-period edge cases — with no database required to run `go test ./...`
- **Verified end-to-end** via `docker compose up`: migrations apply, seeded login, a full payment → active membership → backdated-expiry → sweep-to-grace sequence behaves as documented
- **10 concurrent deliveries of the identical webhook payload** produced exactly 1 payment row and exactly 1 membership extension — 1 response with `duplicate:false`, 9 with `duplicate:true`
- **5 concurrent renewal webhooks racing 5 concurrent expiry sweeps** against the same already-past-due membership landed deterministically `active`, with `expires_at` correctly extended — never left stuck in `grace` or `expired` by a sweep that raced ahead of the renewal

Code: [github.com/valpere/subgate](https://github.com/valpere/subgate)

---

## Stack

`Go` · `chi` (router) · `pgx/v5` (no ORM) · `golang-jwt` · `bcrypt` · `PostgreSQL` (`pg_advisory_xact_lock`, `make_interval`) · `Docker Compose` · `testify`
