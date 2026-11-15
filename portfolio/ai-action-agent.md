---
layout: portfolio-item
title: "ai-action-agent — Transactional AI Agent: Catalog Lookup, Order Placement and Booking"
permalink: /portfolio/ai-action-agent/
image: /portfolio/assets/images/ai-action-agent/hero-0900x0530.png
---

## Overview

Most website and messenger bots fail at the exact moment a customer is ready to buy: they answer general FAQ questions from a text document, then tell the buyer to "wait for a manager" to check stock, confirm a size or book a time slot. A transactional AI action agent connects directly to your live product catalog, CRM and booking calendar through strictly typed tool calls — checking real-time stock, assembling the cart, creating the order or reservation, and issuing a payment or tracking link without human intervention.

**Result: routine product lookups, order creation and slot bookings complete in seconds 24/7 inside the chat, while your database and CRM stay protected by deterministic validation.**

---

## The Real Hard Part

Giving an LLM read-write access to an inventory database or CRM is risky if done naively: a free-form prompt can hallucinate a discount, promise an out-of-stock item, or submit malformed fields into an order endpoint. The engineering problem is not making the model talk politely — it is putting a strict transactional boundary (idempotent tool schemas, server-side stock locks, and price verification) between probabilistic natural language and your deterministic business backend.

---

## How It Works

1. **Intent and entity extraction.** The customer writes in natural language (Telegram, Viber, Instagram Direct, WhatsApp or web chat) asking for a product variant, order status or appointment window.
2. **Read-only tool calls against live state.** Before quoting any price, availability or time slot, the agent calls typed read tools (`search_catalog`, `check_stock`, `get_free_slots`, `lookup_order`) against your store API, DB replica or CRM. It never guesses prices or stock from static prompt text.
3. **Deterministic validation gate.** When the buyer confirms an order or booking, a Go/Python middleware layer validates the payload (SKU existence, current price, phone E.164 format, delivery branch ID, idempotency key) before executing the write tool (`create_order`, `reserve_slot`, `generate_payment_link`).
4. **Confirmation and CRM sync.** The customer receives the order number, payment link or calendar invite right in the chat, while the full deal card and conversation log appear in your CRM (KeyCRM, SalesDrive, KeepinCRM, HubSpot or custom backend).

---

## Key Decisions

| Decision | Why |
|---|---|
| Strict JSON Schema tool calling, never free-text SQL/API | The model can only invoke a fixed whitelist of typed functions (`check_stock`, `create_order`, `book_slot`). Any parameter outside the schema is rejected before touching your backend. |
| Server-owned cart and price calculation | The LLM selects SKUs and quantities, but totals, discounts and taxes are computed exclusivamente by deterministic backend code — zero risk of "prompt-injected" discounts. |
| Idempotency keys on every write action | If a user taps twice or a webhook retries, the middleware deduplicates the call by `(session_id, action_hash)` so duplicate orders or double bookings never happen. |
| Sub-5-second response budget | Catalog and slot queries run against indexed local caches (Redis / PostgreSQL) synced with your store, keeping end-to-end turn latency under 2–4 seconds. |

---

## What You Get

- Transactional AI agent connected to your live catalog, CRM and calendar APIs
- Validated read/write tool layer (`check_stock`, `create_order`, `book_slot`, `order_status`) with idempotency protection
- Deployment in your channels (web chat widget, Telegram, Viber, Instagram Direct, WhatsApp)
- Full audit log of every tool call, payload and CRM transaction

---

## Boundaries

- Irreversible financial operations (issuing refunds, changing bank details, deleting customer records) are never exposed to autonomous tool execution and always route to a human operator.
- Requires an accessible API, webhook interface or database feed for your catalog/CRM.

---

## Stack

`Go` · `Python` · `OpenAI / Claude Tool Calling (Structured Outputs)` · `PostgreSQL` · `Redis` · `KeyCRM / SalesDrive / Shopify / WooCommerce / Horoshop APIs` · `Telegram / Viber / Meta Webhooks`
