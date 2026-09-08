---
layout: portfolio-item
title: "v2v-demo — Multi-Vertical Voice AI Concierge for Telegram"
permalink: /portfolio/v2v-demo/
image: /portfolio/assets/images/v2v-demo/v2v-demo-en.png
---

## Overview

Independent demo project: a Go Telegram bot that holds a real bilingual (Ukrainian/English) voice-or-text conversation, answers only from a fixed knowledge base, and hands off to a human the moment it isn't sure. What started as a single scenario grew into five genuinely independent assistants — dental clinic, car service, real estate agency, cleaning company, translation bureau — selectable from one inline picker on `/start`, each with its own knowledge base, system prompt, and lead-collection schema, all running the same grounding-gate core.

**Result: one framework, five business verticals, no forked codebase — every assistant shares the same grounding gate, and a scripted scenario-probe tool caught a real safety-relevant bug (a dental sedation request getting scheduled as a routine booking) before it ever reached a user.**

---

## The actual hard problem

A voice bot's fluency hides its accuracy. A natural-sounding voice reading a vague or subtly invented answer fails the one thing that matters — so the architecture is built around grounding, not eloquence: the whole knowledge base rides in every prompt, a keyword gate catches off-topic or liability questions *before* the LLM ever runs, and the model is instructed to hand off rather than invent. Making that generalize to five unrelated businesses without forking the code is the second hard problem: each topic supplies its own knowledge base, prompt, greeting, office hours, and slot schema through one JSON manifest — the gate, the LLM orchestration, and the Telegram plumbing stay identical underneath.

---

## Architecture

![v2v-demo turn flow: grounding gate before the LLM, escalate or reply, lead record on a completed quote](/portfolio/assets/images/v2v-demo/v2v-demo-en.png)

Every turn runs through one gate before any LLM call: a keyword-overlap score against the active topic's knowledge base, plus a hard-escalate keyword list for liability topics. Below the confidence floor, or on a liability hit, the bot hands off immediately — no LLM, no guess. Above it, the LLM answers from that topic's full knowledge base and updates a structured lead record (the fields differ per topic — a dental booking collects a preferred time, a real-estate lead collects budget and district); a completed record is written out as a lead.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| One JSON manifest (`topics.json`) drives the picker | Each topic supplies its own KB, prompt, greeting, office hours, and slot schema; adding a sixth business is a data change, not a code change — the picker itself only appears once two or more topics are declared |
| Per-topic office hours gate the escalation copy, not just the KB | A dental clinic and a 24-day-a-week cleaning company have different "we're closed" behavior; the open/closed decision runs in Go against a fixed timezone, never left to the model to infer |
| A scripted scenario-probe tool runs real dialogue turns through the live pipeline | `dialog-probe` replays scenario files against the actual grounding gate + LLM — no Telegram, no unit-test mocking — and is how the sedation-escalation bug below was actually found |
| Whole knowledge base in every prompt, no retrieval-for-context | At this KB size per topic (~19–36 KB), retrieval only adds a failure mode (missing the right chunk) for no benefit — the keyword gate still runs separately as a pre-LLM filter |

---

## Results

- **Five independent, bilingual assistants live behind one picker**: dental clinic, car service, real estate agency, cleaning company, translation bureau — each with its own knowledge base, greeting, and lead schema, sharing one grounding-gate core
- **A real safety-relevant bug found by an automated probe sweep, not a user report**: a dental request phrased as "the child needs treatment under sedation" was landing as a routine bookable appointment — sedation needs an anaesthetist consult and case-by-case pricing, never a collected lead. Fixed with a dedicated hard-rule in the topic's own prompt, verified against three phrasings plus a control case that a normal cleaning booking still completes
- **Two more grounding-gate fixes found the same way**: a bare phone number (the last thing every lead-collecting topic asks for) was hitting the "please clarify" line instead of completing the lead; and a caller asking for "an administrator" or "a specialist" (not "a manager") wasn't recognized as an explicit handoff request
- **124 passing tests** (`gofmt` + `go vet` + `go test -race`), one main third-party dependency (`go-telegram/bot`) plus a language-detection library — everything else is the Go standard library

Code: [github.com/valpere/v2v-demo](https://github.com/valpere/v2v-demo)

---

## Stack

`Go` · `go-telegram/bot` · `lingua-go` (language detection) · OpenAI Whisper (local CLI + API) · Ollama / OpenAI / Gemini (pluggable dialogue LLM) · ElevenLabs / Azure Neural TTS (pluggable)
