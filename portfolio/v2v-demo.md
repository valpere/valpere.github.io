---
layout: portfolio-item
title: "v2v-demo — Multi-Vertical AI Concierge: Telegram Bot, Mini App and Web"
permalink: /portfolio/v2v-demo/
image: /portfolio/assets/images/v2v-demo/v2v-demo-en.png
---

## Overview

A Go engine for a voice-and-text AI concierge, served through three interfaces on one API — a Telegram bot, a Telegram Mini App and a web page. It holds a real bilingual (Ukrainian/English) voice-or-text conversation in each of them, answers only from a fixed knowledge base, and hands off to a human the moment it isn't sure. What started as a single scenario grew into ten genuinely independent assistants — dental clinic, car service, real estate agency, cleaning company, translation bureau, beauty salon, barbershop, restaurant, pizzeria and an acupressure-products shop — selectable from one inline picker on `/start` (which also links to the portfolio, projects, briefs and about pages), each with its own knowledge base, system prompt, and lead-collection schema, all running the same grounding-gate core.

**Result: one framework, ten business verticals, no forked codebase — every assistant shares the same grounding gate, and a scripted scenario-probe tool caught a real safety-relevant bug (a dental sedation request getting scheduled as a routine booking) before it ever reached a user.**

**This is a live demo, not a screenshot — try it yourself:** message [@v2v_demo_bot](https://t.me/v2v_demo_bot) on Telegram and pick a vertical from `/start`; tap **Open Concierge** in the bot for the Mini App; or open the web version at [web.pere.org.ua](https://web.pere.org.ua/). Same engine, same assistants, three ways in.

---

## One engine, three interfaces

The conversation logic — sessions, topics, limits, speech-to-text, grounded dialogue, text-to-speech, leads — lives in the engine and is exposed through one `/v1` API. Each interface is a thin client on top of it:

| Interface | What it adds |
|---|---|
| **Telegram bot** ([v2v-bot](https://github.com/valpere/v2v-bot)) | Long-poll adapter: voice or text in the chat, the topic picker, voice replies |
| **Telegram Mini App** ([v2v-tma](https://github.com/valpere/v2v-tma)) | Opens from the **Open Concierge** button in the bot: a full mobile screen with Voice-to-UI (a spoken or typed command highlights a product and adds it to the cart), a cart and prices owned by the server, Telegram `initData` verified with HMAC-SHA256, and payment through a Telegram Stars invoice |
| **Web** ([v2v-web](https://github.com/valpere/v2v-web)) | A plain page with the topic picker, chat and cart; a small Go server serves it and proxies `/v1`, vouching for each visitor with an anonymous cookie id and per-visitor and per-IP rate limits |

![The bot description in Telegram with the Open Concierge button that launches the Mini App](/portfolio/assets/images/v2v-demo/bot-open-concierge-1-0620x0610.png)

---

## The actual hard problem

A voice bot's fluency hides its accuracy. A natural-sounding voice reading a vague or subtly invented answer fails the one thing that matters — so the architecture is built around grounding, not eloquence: the whole knowledge base rides in every prompt, a keyword gate catches off-topic or liability questions *before* the LLM ever runs, and the model is instructed to hand off rather than invent. Making that generalize to ten unrelated businesses without forking the code is the second hard problem: each topic supplies its own knowledge base, prompt, greeting, office hours, and slot schema through one JSON manifest — the gate, the LLM orchestration, and the Telegram plumbing stay identical underneath.

---

## Architecture

![v2v-demo turn flow: grounding gate before the LLM, escalate or reply, lead record on a completed quote](/portfolio/assets/images/v2v-demo/v2v-demo-en.png)

Every turn runs through one gate before any LLM call: a keyword-overlap score against the active topic's knowledge base, plus a hard-escalate keyword list for liability topics. Below the confidence floor, or on a liability hit, the bot hands off immediately — no LLM, no guess. Above it, the LLM answers from that topic's full knowledge base and updates a structured lead record (the fields differ per topic — a dental booking collects a preferred time, a real-estate lead collects budget and district); a completed record is written out as a lead.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| One JSON manifest (`topics.json`) drives the picker | Each topic supplies its own KB, prompt, greeting, office hours, and slot schema; adding an eleventh business is a data change, not a code change — the picker itself only appears once two or more topics are declared |
| Per-topic office hours gate the escalation copy, not just the KB | A dental clinic and a 24-day-a-week cleaning company have different "we're closed" behavior; the open/closed decision runs in Go against a fixed timezone, never left to the model to infer |
| A scripted scenario-probe tool runs real dialogue turns through the live pipeline | `dialog-probe` replays scenario files against the actual grounding gate + LLM — no Telegram, no unit-test mocking — and is how the sedation-escalation bug below was actually found |
| Whole knowledge base in every prompt, no retrieval-for-context | At this KB size per topic (~17–37 KB), retrieval only adds a failure mode (missing the right chunk) for no benefit — the keyword gate still runs separately as a pre-LLM filter |

---

## Results

- **Ten independent, bilingual assistants live behind one picker**: dental clinic, car service, real estate agency, cleaning company, translation bureau, beauty salon, barbershop, restaurant, pizzeria, acupressure shop — each with its own knowledge base, greeting, and lead schema, sharing one grounding-gate core
- **A real safety-relevant bug found by an automated probe sweep, not a user report**: a dental request phrased as "the child needs treatment under sedation" was landing as a routine bookable appointment — sedation needs an anaesthetist consult and case-by-case pricing, never a collected lead. Fixed with a dedicated hard-rule in the topic's own prompt, verified against three phrasings plus a control case that a normal cleaning booking still completes
- **Two more grounding-gate fixes found the same way**: a bare phone number (the last thing every lead-collecting topic asks for) was hitting the "please clarify" line instead of completing the lead; and a caller asking for "an administrator" or "a specialist" (not "a manager") wasn't recognized as an explicit handoff request
- **One engine behind three interfaces**: the Telegram bot, the Mini App and the web page share the same assistants, limits and grounding gate — a new front end is a thin client, not a new product
- **Checked on every push** (`gofmt` + `go vet` + `go test -race`), one main third-party dependency (`go-telegram/bot`) plus a language-detection library — everything else is the Go standard library

Live demo: [@v2v_demo_bot](https://t.me/v2v_demo_bot) on Telegram (the **Open Concierge** button opens the Mini App) · [web.pere.org.ua](https://web.pere.org.ua/) · Code: [github.com/valpere/v2v-demo](https://github.com/valpere/v2v-demo)

---

## Stack

`Go` · `go-telegram/bot` · `Telegram Mini Apps` · `Telegram Stars` · `Web Speech API` · `lingua-go` (language detection) · OpenAI Whisper (local CLI + API) · Ollama / OpenAI / Gemini (pluggable dialogue LLM) · ElevenLabs / Azure Neural TTS (pluggable)
