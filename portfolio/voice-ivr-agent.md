---
layout: portfolio-item
title: "voice-ivr-agent — Full-Duplex AI Voice IVR for Inbound Support and Order Confirmation"
permalink: /portfolio/voice-ivr-agent/
image: /portfolio/assets/images/voice-ivr-agent/hero-0900x0530.png
---

## Overview

Customers hate rigid "Press 1 for sales, press 2 for status" phone trees, and businesses lose orders when inbound calls go unanswered during peak hours or nights, or when managers spend half the day dialing buyers just to confirm shipping addresses. `voice-ivr-agent` is a conversational, full-duplex AI voice agent for SIP telephony and web calls that speaks naturally, handles mid-sentence interruptions (barge-in), executes live CRM actions (confirming orders, checking TTN status, booking appointments) and routes complex calls to the right human extension.

**Result: 100% of inbound calls answered on the first ring 24/7, automated outbound order/appointment confirmations, and direct CRM updates without phone queues.**

---

## The Real Hard Part

A phone call is unforgiving of latency and awkward turn-taking. If a voice bot pauses for 4 seconds before replying, or keeps talking for 15 seconds while the caller is trying to interrupt ("Wait, I meant tomorrow!"), the caller hangs up. Building a production phone agent requires sub-second voice activity detection (VAD), instant barge-in cancellation of the audio stream, phrase caching for high-frequency prompts, and strict state machines so the model never loses track of order numbers or dates over noisy mobile lines.

---

## How It Works

1. **SIP / WebRTC stream & instant barge-in.** Incoming or outbound calls connect via SIP trunk / PBX (Binotel, Ringostat, Asterisk, FreeSWITCH, Twilio) or browser WebRTC. Server-side VAD monitors caller speech continuously: the millisecond the caller speaks over the bot, outbound TTS playback flushes and the agent listens.
2. **Low-latency STT + hybrid TTS pipeline.** Streaming Speech-to-Text transcribes Ukrainian, English, Polish or mixed-language speech with custom vocabulary boosting for brand names, streets and SKU codes. Fixed conversational framing uses pre-cached high-naturalness audio (ElevenLabs), while dynamic data (prices, delivery dates, slot times) streams via ultra-low-latency TTS.
3. **Live CRM & calendar tool execution.** While conversing, the Go orchestrator executes typed backend actions: confirming an e-commerce order (`confirm_order`, updating Nova Poshta branch or payment method), checking parcel status by caller phone number, or booking/rescheduling a clinic or service slot.
4. **Warm SIP transfer with text brief.** When the caller needs a human specialist, the agent triggers a SIP transfer to the target extension and simultaneously posts the call summary, caller profile and audio/transcript link into the operator's CRM card or Telegram channel.

---

## Key Decisions

| Decision | Why |
|---|---|
| Full-duplex barge-in handling | Real callers interrupt when they already know what they want to say. Canceling the TTS buffer within 150 ms makes the conversation feel human rather than robotic. |
| Hybrid pre-cached + streaming TTS | Pre-generating recurring transitions and confirmations eliminates synthesis delay on 70% of turns and cuts monthly voice API costs by 3–5x. |
| Digit & address confirmation state machine | Phone audio often clips digits or street names. The orchestrator enforces explicit read-back confirmation for numbers, branches and time slots before writing to CRM. |
| Async CRM prefetch on Caller ID (`ANI`) | As the phone rings, the server already fetches the caller's name, open orders and upcoming bookings by phone number — so the agent greets them with context in the first second. |

---

## What You Get

- Conversational AI voice agent connected to your IP telephony (Binotel, Ringostat, Asterisk, Twilio) and/or web call widget
- Inbound support scenarios (order status, FAQ, appointment booking, smart routing) and outbound confirmation campaigns
- Direct integration with your CRM, calendar and delivery APIs, including call recordings and structured transcripts
- Warm transfer to live operators with instant text summary delivery

---

## Boundaries

- Does not run cold spam robocalling; outbound calls are strictly for transactional events (order confirmation, delivery notification, appointment reminder) requested by your customers.
- Requires SIP trunk / webhook access from your telephony provider.

---

## Stack

`Go` · `SIP / RTP / WebRTC` · `Binotel / Ringostat / Asterisk / FreeSWITCH / Twilio` · `Streaming STT (Whisper / Deepgram / Azure)` · `ElevenLabs & Azure Realtime TTS` · `OpenAI / Claude Tool Calling` · `Redis` · `PostgreSQL`
