---
layout: portfolio-item
title: "anti-bot-intake-gate — 3-Layer Anti-Bot & Anti-Spam Gate for Web Forms, APIs & Telegram"
permalink: /portfolio/anti-bot-intake-gate/
image: /portfolio/assets/images/anti-bot-intake-gate/hero-0900x0530.png
---

## Overview

Modern spam scripts and AI agents bypass traditional CAPTCHAs and flood website lead forms, public APIs and Telegram communities with synthetic submissions, click-fraud leads and fake signups. Blocking traffic blindly with aggressive firewalls hurts real customers, while leaving forms open floods your inbox and CRM with garbage. A **3-Layer Anti-Bot & Anti-Spam Intake Gate** combines edge protection (Cloudflare Turnstile, WAF, rate limiting), deterministic behavioral checks, and a lightweight Cognitive Proof-of-Work challenge for suspicious submissions.

**Result: automated bot floods and AI form spam drop by 95%+, real users pass frictionlessly in milliseconds, and your CRM, email and Telegram chats stay clean.**

---

## The Real Hard Part

Classic visual CAPTCHAs frustrate real buyers on mobile while cheap solver farms and headless AI browsers bypass them easily. Pure IP blacklists fail behind mobile CGNAT and residential proxies. Reliable defense requires defense-in-depth: cheap deterministic checks at the edge, server-side behavioral signals (timing, honeypots, disposable-domain and E.164 checks), and escalating only suspicious traffic to a domain-specific Cognitive Gate that stateless bots cannot pass cheaply.

---

## How It Works

1. **Layer 1 — Edge & protocol shield.** Cloudflare WAF rules, invisible Turnstile tokens, per-IP/subnet sliding-window rate limits in Redis, and TLS/ASN anomaly scoring stop volumetric bot floods before they reach your backend.
2. **Layer 2 — Deterministic behavioral & payload gate.** Server middleware inspects submission timing (sub-second fills), hidden honeypot fields, disposable email domains, repeated payload hashes and phone/Telegram profile heuristics at zero LLM cost.
3. **Layer 3 — Adaptive Cognitive Gate (only for gray-zone traffic).** Submissions that pass Layer 1–2 but look suspicious (or Telegram group joiners / public ticket forms) receive one short, context-bound verification prompt with a tight TTL — trivial for a real human, fatal for stateless spam scripts.
4. **Quarantine & telemetry.** Blocked requests are logged with reason codes (`waf_rate`, `honeypot`, `turnstile_fail`, `cognitive_timeout`) into a quarantine table so false positives can be audited and whitelisted without losing legitimate leads.

---

## Key Decisions

| Decision | Why |
|---|---|
| Invisible Cloudflare Turnstile instead of puzzle CAPTCHAs | Real visitors pass automatically without clicking traffic lights, preserving form conversion on mobile. |
| Three escalating layers (Edge → Deterministic → Cognitive) | Stops 90% of junk at near-zero cost before touching LLM or human review budgets. |
| Quarantine queue instead of silent drops | Lets site owners audit blocked edge cases and tune rules without silently discarding a real customer. |
| Works on both Web/API and Telegram communities | Same Redis rate-limit + behavioral + cognitive challenge engine protects WordPress/OpenCart/custom forms and Telegram chats/bots. |

---

## What You Get

- Configured Cloudflare WAF + Turnstile + Nginx/Redis rate-limiting rules for your site and APIs
- Backend anti-spam middleware (Go / Python / PHP) with honeypots, payload deduplication and quarantine logging
- Optional Telegram anti-spam moderation bot with cognitive join verification and auto-muting of spam accounts
- Monitoring dashboard/alerts for attack spikes and clear documentation for rule tuning

---

## Boundaries

- Protects application-layer forms, APIs and Telegram intake; volumetric L3/L4 DDoS mitigation still relies on upstream CDN/Cloudflare network protection.
- Requires DNS/Cloudflare access for edge rules or server access for backend/Telegram middleware.

---

## Stack

`Cloudflare WAF & Turnstile` · `Nginx` · `Go / Python / PHP` · `Redis` · `PostgreSQL` · `Telegram Bot API` · `Behavioral Scoring` · `Cognitive Gate`
