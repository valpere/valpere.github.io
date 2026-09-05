---
layout: portfolio-item
title: "v2v-demo — Bilingual Voice AI Concierge for Telegram"
permalink: /portfolio/v2v-demo/
image: /portfolio/assets/images/v2v-demo/v2v-demo-en.png
---

## Overview

Independent demo project: a Go Telegram bot that holds a real bilingual (Ukrainian/English) voice-or-text conversation, answers only from a fixed knowledge base, and hands off to a human the moment it isn't sure — instead of the plausible-sounding guess that makes most support bots untrustworthy. Built in 6 days as a standalone, self-contained loop: no framework, one main dependency.

**Result: a voice concierge that grounds every answer in its knowledge base and escalates rather than guesses — a real grounding-gate bug (correct on-topic answers getting escalated) found and fixed via a live Telegram smoke test, not just unit tests; 128 passing tests total.**

---

## The actual hard problem

A voice bot's fluency hides its accuracy. A natural-sounding voice reading a vague or subtly invented answer fails the one thing that matters — so the architecture is built around grounding, not eloquence: the whole knowledge base rides in every prompt, a keyword gate catches off-topic or liability questions *before* the LLM ever runs, and the model is instructed to hand off rather than invent.

---

## Architecture

![v2v-demo turn flow: grounding gate before the LLM, escalate or reply, lead record on a completed quote](/portfolio/assets/images/v2v-demo/v2v-demo-en.png)

Every turn runs through one gate before any LLM call: a keyword-overlap score against the knowledge base, plus a hard-escalate keyword list for liability topics. Below the confidence floor, or on a liability hit, the bot hands off immediately — no LLM, no guess. Above it, the LLM answers from the full knowledge base and updates a structured quote (language pair, document type, volume, deadline, certification, delivery); a completed quote is written out as a lead record.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Whole knowledge base in every prompt, no retrieval-for-context | At this KB size (~19 KB), retrieval only adds a failure mode (missing the right chunk) for no benefit — the keyword gate still runs separately as a pre-LLM filter |
| Bilingual KB — one English and one Ukrainian block under every heading | A single-language KB can't ground a Ukrainian question with the same coverage as an English one; per-language blocks fixed a real cross-language gate miss found while building |
| Per-chat serial worker goroutine, not just a per-chat mutex | A mutex serializes access but not arrival order — a user's own messages could be answered out of sequence; a dedicated worker per chat, fed by a channel, fixed it |
| LLM/STT/TTS each behind a small interface, selected by one env var | `DIALOG_BACKEND`/`STT_BACKEND`/`TTS_BACKEND` swap Ollama ↔ OpenAI ↔ Gemini, local Whisper ↔ Whisper API, and ElevenLabs ↔ Azure Neural — a cost/latency/quality tradeoff picked per deployment, zero code changes |

---

## Results

- **Full voice-and-text loop**: Telegram long-poll, voice download → local Whisper or Whisper API transcription, a grounding gate, an LLM call behind a pluggable backend, ElevenLabs/Azure text-to-speech, and an append-only JSONL turn/lead log
- **Bilingual, mid-conversation language switch**: `lingua-go` detects the active language every turn and re-targets STT, the prompt, and the fixed handoff lines — a user can switch from Ukrainian to English mid-conversation and the bot follows
- **Found live, not designed upfront**: a real grounding-gate bug where ordinary Ukrainian answers were wrongly escalating (an overly strict "is this a slot answer" check, plus a keyword-overlap miss on Ukrainian word inflection) — caught during a live, browser-driven Telegram Web smoke test and fixed with a targeted rule, not a rewrite
- **128 passing tests** (`gofmt` + `go vet` + `go test -race`), one main third-party dependency (`go-telegram/bot`) plus a language-detection library — everything else is the Go standard library

Code: [github.com/valpere/v2v-demo](https://github.com/valpere/v2v-demo)

---

## Stack

`Go` · `go-telegram/bot` · `lingua-go` (language detection) · OpenAI Whisper (local CLI + API) · Ollama / OpenAI / Gemini (pluggable dialogue LLM) · ElevenLabs / Azure Neural TTS (pluggable)
