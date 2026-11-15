---
layout: portfolio-item
title: "smart-handoff — Confidence-Gated AI-to-Human Escalation with Context Briefs"
permalink: /portfolio/smart-handoff/
image: /portfolio/assets/images/smart-handoff/hero-0900x0530.png
---

## Overview

The quickest way an AI support bot destroys customer trust is by refusing to let go: repeating "I didn't quite catch that" when the user has a non-standard problem, or dumping the chat onto a human agent who then asks the customer to explain everything all over again. `smart-handoff` is an escalation and context-packaging layer between your AI agent and your human support team that detects when the bot should step back and hands the operator a clean, structured brief in seconds.

**Result: AI handles the 70–80% of routine requests it actually knows, and the remaining 20–30% reach the right human specialist on the first transfer with zero customer repetition.**

---

## The Real Hard Part

Knowing *when* to escalate is harder than answering a FAQ. If the threshold is too loose, the bot hallucinates answers on edge cases (damaged parcels, custom B2B quotes, billing disputes); if too hair-trigger, 60% of simple chats flood human operators. Worse, dumping a 30-message raw transcript onto a busy operator slows them down instead of helping. Escalation has to combine deterministic tripwires (high-risk intents, repeated turn loops, explicit human requests) with a compact structured handoff packet.

---

## How It Works

1. **Multi-signal escalation gate.** Every conversation turn is evaluated against four conditions:
   - *Low grounding confidence:* RAG retrieval score falls below threshold or the question is outside the knowledge base.
   - *High-stakes intent:* refund claims, payment failures, legal/complaint keywords, or B2B custom pricing.
   - *Loop & sentiment detector:* 2+ clarification attempts on the same step, negative sentiment spike, or an explicit "operator / human" request.
   - *Tool failure:* an underlying CRM or stock API returns an error or ambiguous match.
2. **State lock and bot mute.** The moment any tripwire fires, the state machine flips the thread from `bot_active` to `human_assigned`, muting automated replies so the bot never talks over the operator.
3. **Structured 4-line operator brief.** Before notifying the team, a fast summarization pass extracts a strict JSON brief attached to the top of the ticket:
   - **Customer & Order:** verified name, phone/handle, linked CRM order ID and status.
   - **Core Issue:** one-sentence statement of what the customer wants.
   - **Already Checked:** what the bot already verified (e.g. "TTN 204509... shows arrived at branch #12; customer says box is damaged").
   - **Why Escalated:** trigger reason (`refund_request`, `low_kb_confidence`, `user_requested_human`).
4. **Skill-based routing and return to AI.** The thread is routed to the matching operator group (Sales, Logistics, Billing, Tech Support) in Telegram, Slack or your Helpdesk/CRM. Once the operator resolves the edge case, they can flip the thread back to `bot_active` with one command.

---

## Key Decisions

| Decision | Why |
|---|---|
| Deterministic tripwires alongside confidence scores | LLM self-reported confidence is poorly calibrated on its own. Combining retrieval similarity scores, turn-loop counters and hard intent rules makes escalation predictable and auditable. |
| Instant bot mute on handoff (`human_assigned` lock) | Prevents the classic embarrassment where a human operator replies and the bot fires an automated message two seconds later. |
| 4-line structured brief instead of raw chat walls | An operator joining a live chat needs the order link, what was already tried and the exact blocker in 5 seconds — not 40 lines of bot greetings. |
| Working-hours & fallback handling | If escalation happens at 02:00 AM outside shift hours, the system sets honest expectations, collects the exact artifacts needed (e.g. photo of the damaged item) and pins the ready ticket to the morning queue. |

---

## What You Get

- Confidence, loop and risk-intent escalation gate integrated into your existing bot or web chat
- Automatic state locking (`bot_active` ↔ `human_assigned`) with operator return controls
- Compact 4-line context brief with direct CRM/order deep links on every escalated ticket
- Routing by department, shift schedule and SLA priority (Telegram topics, Helpdesk, CRM)

---

## Boundaries

- Does not replace human judgment on disputed refunds or policy exceptions — its job is to bring the right human in at the exact right moment with full context.

---

## Stack

`Go` · `Python` · `Redis (session state machine)` · `PostgreSQL` · `OpenAI / Claude Structured Outputs` · `Telegram Bot API (Forum Topics)` · `Webhooks / Helpdesk / CRM APIs`
