---
layout: portfolio-item
title: "v2v-tma — Voice and Text AI Concierge as a Telegram Mini App"
permalink: /portfolio/v2v-tma/
image: /portfolio/assets/images/v2v-tma/cover-0800x0600.png
---

## Overview

A Telegram Mini App (TMA) client for the voice and text AI concierge from [v2v-demo](/portfolio/v2v-demo/): the same engine, but a full mobile interface instead of a chat. Four business topics (pizzeria, barbershop, car service, shop) in one app, a cart, payment in **Telegram Stars (XTR)**, and **Voice-to-UI**: a spoken or typed command changes the screen live.

**Result: the user says "add a large Pepperoni pizza", the product card lights up, the item lands in the cart, the answer is spoken back, and checkout closes in one tap through the native Telegram Stars sheet with haptic feedback.**

Open source: [github.com/valpere/v2v-tma](https://github.com/valpere/v2v-tma).

---

## The actual hard problem

Most solutions are either text bots in a chat with no visuals, or a website in a WebView with no use of Telegram's native features. The difficulty here is three things at once:

1. **Tie the conversation to the interface.** The engine's reply is not only text but structured instructions for the screen (`ui_actions`): highlight a product, add to cart, open checkout.
2. **Zero cost by default.** Browsing the catalog, search and spoken replies run without paid APIs: text mode by default, speech through the free browser Web Speech API, cloud voice only on an explicit user action.
3. **Payment safety.** The client sends only an `item_id` and a quantity, the server computes the Stars amount, and Telegram's `initData` is verified cryptographically.

---

## Architecture

```
Telegram bot ─┐
this TMA      ─┼─►  /v1 engine API (v2v-demo)  ─►  LLM / STT / TTS
plain web     ─┘
```

The TMA is a thin client. The `/v1` contract is documented separately (`docs/API.md`): sessions, messages answered with `{reply, intent, ui_actions[], cart}`, the catalog, and payment. For standalone use the repository includes a Go server implementing the same contract with deterministic keyword search; with `ENGINE_URL` set it proxies `/v1` to the real v2v-demo engine and the client does not change.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| One `/v1` contract for the bot, the Mini App and plain web | Clients stay thin, while logic, limits and the catalog live in one engine |
| A `ui_actions` protocol (`HIGHLIGHT_ITEM`, `ADD_TO_CART`, `OPEN_CHECKOUT`) | The conversation drives the interface with no text parsing on the client; the server has already applied the change, and the returned `cart` is the single source of truth |
| The server owns the cart and prices | The client cannot tamper with the total; the Telegram invoice is created from the server-side sum |
| `initData` verification (HMAC-SHA256, up to 24 hours) | Requests from outside the Telegram client are rejected; dev mode skips it only with an explicit `DEV_AUTH=1` |
| Native Telegram SDK haptics | Adding to the cart and paying trigger vibration, so the app behaves like a native one |

---

## Results

- **A working Mini App client**: 4 business topics, voice and text input, product highlighting, a cart, a Telegram Stars invoice.
- **A clean Go backend**: 24 tests, `make check` (gofmt, vet, tests with `-race`, build), starts in a second, no heavy dependencies.
- **A clear path to production**: connecting the real engine through `ENGINE_URL`, HTTPS for the Mini App, and payment confirmation are laid out step by step in `docs/HANDOFF.md`.
- **Open source**: Apache-2.0; catalogs and brand names in the demo data are not licensed.

Part of the v2v family: the [v2v-demo](/portfolio/v2v-demo/) engine and three front ends on the same `/v1` API — the Telegram bot ([v2v-bot](https://github.com/valpere/v2v-bot)), this Mini App and a plain web page ([v2v-web](https://github.com/valpere/v2v-web)).

---

## Stack

`Telegram WebApp SDK` · `Telegram Stars (XTR)` · `Go` · `Web Speech API` · `HMAC-SHA256` · `REST API` · `HTML / JavaScript`
