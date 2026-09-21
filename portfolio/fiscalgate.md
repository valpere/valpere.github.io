---
layout: portfolio-item
title: "fiscalgate — Payments to Checkbox Fiscal Receipts, Exactly Once"
permalink: /portfolio/fiscalgate/
image: /portfolio/assets/images/fiscalgate/hero-0900x0530.png
---

## Overview

Independent project: a Go service that turns confirmed **Monobank** and **LiqPay** payments (and cash on delivery) into **Checkbox** PRRO fiscal receipts, handles refunds as return receipts, and opens and closes the shift (Z-report) on schedule.

**Result: 300 orders × 4 concurrent copies of every webhook produce exactly 300 receipts; a lost reply from the register never doubles a receipt; prepayment plus cash on delivery becomes one receipt with two tenders.**

---

## The actual hard problem

Issuing a fiscal receipt is one HTTP call. Doing it correctly is not: providers retry webhooks until they see a 2xx, two copies can be in flight at once, the register's reply can get lost after the receipt was already accepted, the register can be down, and some orders are paid two ways. Every one of those must end in exactly one receipt — never zero, never two.

---

## Architecture

![fiscalgate: webhook, settle, outbox, Checkbox, customer link](/portfolio/assets/images/fiscalgate/hero-0900x0530.png)

A verified webhook records the payment under a unique `(provider, payment id)` key; when the order is paid in full, one fiscal job is queued in the same transaction. A worker opens the shift on demand and posts the receipt with our own UUID, then polls until the register says DONE, and sends the receipt link to the customer.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Unique payment key + job queued in the completing transaction | Duplicate and concurrent webhooks are no-ops by construction, not by timing |
| Our own UUID as the receipt id; look up before any retry | If the reply was lost, the retry finds the receipt instead of posting a second one |
| Exponential backoff, visible `failed` state, requeue endpoint | An outage delays a receipt but cannot lose it; a job that gives up is visible with its reason |
| Receipt only when paid exactly in full | Card prepayment + cash on delivery = one receipt with two tenders; an overpayment waits for a human |
| Refunds bounded by the sale, card first then cash, idempotent by key | The return receipt can never exceed what was sold or refund twice |
| Shift closed after the daily boundary, only when no receipt is in flight | The Z-report never lands in the middle of a sale |

---

## Results

| Check | Result |
|---|---|
| Concurrency | 300 orders × 4 concurrent webhook copies → exactly 300 receipts |
| Register outage | 3 failed attempts → retried with backoff → one receipt |
| Lost reply after a successful POST | one POST, one receipt |
| Tests | 26 under the race detector, 68–82% coverage per package |

---

## Connecting it to production

- **Checkbox:** set `checkbox.base_url`, `login`, `password`, `license_key` (`${VAR}` reads the environment).
- **Monobank / LiqPay:** set the token or private key and register `/webhooks/monobank` and `/webhooks/liqpay` as callbacks.
- **Your shop:** `POST /api/orders` on order creation, `…/cod-paid` on delivery, `…/refund` for returns.
- **Another register or acquirer:** one type implementing `service.Fiscal`, or one parser returning `acquiring.Payment`.

**Source:** [github.com/valpere/fiscalgate](https://github.com/valpere/fiscalgate)

---

## Stack

`Go` · `Checkbox API` · `Monobank` · `LiqPay` · `SQLite` · `Docker`
