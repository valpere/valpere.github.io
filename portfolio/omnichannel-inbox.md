---
layout: portfolio-item
title: "omnichannel-inbox — Unified Shared Inbox and Skill-Based Ticket Routing"
permalink: /portfolio/omnichannel-inbox/
image: /portfolio/assets/images/omnichannel-inbox/hero-0900x0530.png
---

## Overview

When customer messages arrive across five separate tabs — Telegram, Viber, Instagram Direct, WhatsApp, email and website live chat — leads get lost between shifts, two managers reply to the same buyer on different channels, and nobody knows the true first-response time. `omnichannel-inbox` consolidates every messaging channel and telephony webhook into a single shared inbox and structured ticket pipeline, linking every conversation to one unified customer profile in your CRM.

**Result: zero lost messages across channels, a single timeline per customer regardless of where they write, and automatic ticket routing to the right specialist with SLA tracking.**

---

## The Real Hard Part

Every messaging platform has its own webhook quirks, media expiration rules, rate limits and 24-hour messaging windows (Meta / WhatsApp Business API). Worse, the same customer might ask a pre-sale question on Instagram, place the order on the website, and message on Viber about delivery. A reliable shared inbox has to normalize message schemas, re-host ephemeral media attachments, deduplicate customer identities across channels, and prevent two operators from colliding on the same ticket.

---

## How It Works

1. **Unified webhook ingestion & media vault.** A Go gateway receives webhooks from Telegram (Bot API / Business), Viber, Meta (Instagram Direct & Facebook Messenger), WhatsApp Cloud API, IMAP/SMTP email and your website chat widget. Voice notes, photos and PDFs are immediately downloaded and stored in S3/R2 so expiring platform links never break ticket history.
2. **Cross-channel identity resolution.** Incoming contacts are matched against existing profiles by normalized phone number (E.164), email, order number or platform handle. When a buyer switches from web chat to Telegram, the operator sees both threads linked to the same CRM customer and order history.
3. **Intent classification & skill-based ticket routing.** Each new conversation is tagged by topic (New Order, Delivery/TTN, Warranty/Return, Billing, B2B) and language, then routed to the responsible department queue with round-robin or load-balanced assignment among online operators.
4. **Collision lock, SLA timers & CRM sync.** Presence indicators show when an operator is viewing or typing in a ticket. If a ticket approaches its SLA response limit (e.g. 5 minutes for hot leads), it escalates to the shift queue and logs response-time metrics to PostgreSQL and your CRM.

---

## Key Decisions

| Decision | Why |
|---|---|
| Normalized internal event bus (Redis Streams / PostgreSQL) | Decouples unreliable external messenger APIs from your operator UI: outbound replies queue safely and retry with backoff if a messenger endpoint hiccups. |
| E.164 phone + order-ID identity graph | Solves the "split personality" problem where CRM shows three separate leads for one customer writing from Viber, Instagram and email. |
| Optimistic ticket locking & live presence | Stops two operators from typing conflicting answers to the same client at the same time. |
| First-class Meta 24h window tracking | Automatically tracks WhatsApp / Instagram messaging window expiry and switches to approved template messages when a 24h session closes. |

---

## What You Get

- Unified shared inbox connecting Telegram, Viber, Instagram Direct, WhatsApp, Email, Web Chat and IP telephony events
- Cross-channel customer deduplication and two-way sync with your CRM (KeyCRM, SalesDrive, KeepinCRM, HubSpot or custom workspace)
- Skill-based ticket queues, collision prevention and SLA breach alerts
- Real-time support analytics: First Response Time (FRT), resolution time, channel volume and operator load

---

## Boundaries

- Official WhatsApp Business API and Instagram Direct integrations require a verified Meta Business account.
- Can be deployed either on top of an open-source workspace (e.g. Chatwoot / custom web UI) or bridged directly into your existing CRM/Telegram Topics workflow.

---

## Stack

`Go` · `PostgreSQL` · `Redis Streams` · `WebSockets` · `S3 / Cloudflare R2` · `Telegram / Viber / Meta Graph / WhatsApp Cloud APIs` · `Chatwoot / Custom Web Inbox` · `CRM Webhooks`
