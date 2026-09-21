---
layout: portfolio-item
title: "crmbridge — Shop, Telephony and Parcels in One CRM"
permalink: /portfolio/crmbridge/
image: /portfolio/assets/images/crmbridge/hero-0900x0530.png
---

## Overview

Independent project: a Go service that connects a **shop or Telegram bot**, **Binotel** telephony and **Nova Poshta** to a **SalesDrive** CRM. Orders become one deal each, a ringing call shows the caller's card to the responsible manager, a missed call becomes a lead, and a parcel's status moves the deal along the funnel and messages the customer.

**Result: one deal per order even when the site retries or the CRM loses a reply (one create call, one deal); 250 tracked parcels take exactly 3 Nova Poshta requests; statuses 5 → 7 → 5 → 7 → 9 produce one message per stage and never move a deal back.**

---

## The actual hard problem

Pushing an order into a CRM is one HTTP call. Keeping the CRM *right* is not: the site retries, the create call times out, or the CRM creates the order and the answer is lost; telephony sends the same event several times; a CRM webhook can beat the API's own answer; and parcel statuses flap. Every one of those has to end in a single, correct deal.

---

## Architecture

![crmbridge: shop, outbox, SalesDrive, Nova Poshta, customer](/portfolio/assets/images/crmbridge/hero-0900x0530.png)

An order is stored under its id (the idempotency key) and queued in an outbox. The worker creates it in SalesDrive, retrying with backoff; before any re-create it looks the order up by external id. Binotel events and SalesDrive webhooks feed the same store; a tracker polls Nova Poshta in batches and turns forward progress into a funnel status change and a customer message.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Order id = idempotency key; outbox with backoff | A retried request is a no-op; a CRM outage delays a deal but cannot lose it |
| Look up by `externalId` before any re-create | A lost answer cannot produce a second deal |
| Call events stored by call id; a lead window for repeat misses | The same event twice does nothing; a second miss inside 30 minutes adds a note to the lead |
| Notes wait for their lead's creation | A note queued before the lead exists in the CRM still lands on it |
| Parcel status is forward-only, finished parcels stop being polled | A flapping answer cannot drag a deal back or announce "arrived" twice |
| Batched tracking (≤100 TTN per request) | 250 parcels take 3 requests, not 250 |

---

## Results

| Check | Result |
|---|---|
| Lost create answer | one create call, one deal |
| CRM outage | 3 failures → retried with backoff → one deal |
| Parcel flapping | 5 → 7 → 5 → 7 → 9: one message per stage, deal never moves back |
| Tracking | 250 parcels = 3 Nova Poshta requests (100 + 100 + 50) |
| Tests | 25 under the race detector, 66–100% coverage per package |

---

## Connecting it to your accounts

- **SalesDrive:** `salesdrive.base_url` and `api_key`; add the webhook URL; put your funnel status ids in `np_status_map`.
- **Binotel:** send call events to `/webhooks/binotel`; map internal numbers to managers.
- **Nova Poshta:** set `novaposhta.api_key` for live tracking.
- **Another CRM (for example KeyCRM):** implement the five methods of `service.CRM`.

**Source:** [github.com/valpere/crmbridge](https://github.com/valpere/crmbridge)

---

## Stack

`Go` · `SalesDrive API` · `Binotel` · `Nova Poshta API` · `Telegram` · `SQLite` · `Docker`
