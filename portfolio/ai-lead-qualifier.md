---
layout: portfolio-item
title: "ai-lead-qualifier — AI Inbound Lead Qualifier & CRM Spam Filter"
permalink: /portfolio/ai-lead-qualifier/
image: /portfolio/assets/images/ai-lead-qualifier/hero-0900x0530.png
---

## Overview

Businesses running paid ads, website inquiry forms or Telegram/WhatsApp intake channels drown in low-intent inquiries, spam submissions and incomplete leads. Managers burn hours chasing unresponsive contacts while warm buyers wait. An **AI Inbound Lead Qualifier** applies the Cognitive Proof-of-Work principle to your sales and HR funnels: it strips obvious noise deterministically, asks 1–2 crisp domain-specific follow-up questions in real time, scores intent and fit against your criteria, and pushes only verified, structured lead cards into your CRM.

**Result: sales and HR teams stop wading through 80% noise and receive compact, pre-qualified CRM deals with budget, timeline, need and readiness score already filled in.**

---

## The Real Hard Part

A rigid static form with 15 required fields kills conversion, while an open chat box invites one-word messages ("how much?") and spam bots. Meanwhile, a naive LLM chatbot chats endlessly without ever deciding whether the lead is worth a manager's time. The engineering job is building a short, bounded qualification state machine: deterministic pre-checks (phone/email/duplicate detection), 1–2 adaptive domain questions with a clear stop condition, structured JSON scoring (`hot / warm / cold / spam`), and clean CRM routing with zero duplicate cards.

---

## How It Works

1. **Multi-channel intake & deterministic pre-filter.** Leads enter from website forms, Telegram, Instagram Direct, WhatsApp or HR application links. Deterministic rules normalize phone numbers (E.164), deduplicate existing CRM contacts and filter obvious junk before spending a single LLM token.
2. **Adaptive 1–2 question qualification.** Instead of a 15-field questionnaire, the agent asks 1–2 concise, business-specific questions tailored to what the prospect already wrote (e.g., project scope, clinic service type, target date or budget tier).
3. **Structured scoring & Decision Card.** Based on the prospect's answers and response pattern, the backend computes a deterministic + LLM qualification score (`A/B/C` or `hot/warm/cold`) and builds a 4-line summary brief for the manager.
4. **CRM routing & instant handoff.** Hot and warm leads immediately create or update a deal in KeyCRM, SalesDrive, KeepinCRM, GoHighLevel or HubSpot and notify the assigned manager in Telegram; cold or spam inquiries are tagged and archived automatically without interrupting sales.

---

## Key Decisions

| Decision | Why |
|---|---|
| Max 2 follow-up questions, never a long interrogation | Keeps conversion high for busy real buyers while still filtering out drive-by clicks, bots and zero-intent inquiries. |
| Deterministic pre-filter before LLM calls | Catches invalid contacts, duplicates and obvious spam at zero token cost before engaging the model. |
| Structured JSON scorecard into CRM fields | Managers see clean fields (`service`, `budget_tier`, `urgency`, `score`, `summary`) instead of reading raw chat transcripts. |
| Soft archiving instead of hard rejection | Borderline leads are marked low-priority rather than deleted, so no legitimate slow-responding buyer is ever lost. |

---

## What You Get

- Inbound qualification agent connected to your website forms, Telegram, Instagram Direct or WhatsApp
- Custom scoring rules and 1–2 question qualification scripts tuned to your niche (services, clinics, B2B, e-commerce, HR)
- Direct CRM integration (KeyCRM, SalesDrive, KeepinCRM, GoHighLevel, HubSpot or Google Sheets) with deduplication
- Manager Telegram notifications with compact lead briefs and conversion/drop-off metrics

---

## Boundaries

- Does not replace human closing on high-ticket B2B deals; its job is fast 24/7 intake, filtering and warm handoff.
- Requires clear qualification criteria (what makes a lead target vs non-target in your business).

---

## Stack

`Go / Python` · `OpenAI / Claude / OpenRouter Structured Outputs` · `PostgreSQL` · `Redis` · `KeyCRM / SalesDrive / GoHighLevel / HubSpot API` · `Telegram / Meta / Web Form Webhooks` · `n8n`
