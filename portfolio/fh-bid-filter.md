---
layout: portfolio-item
title: "fh-bid-filter — Freelancehunt Employer Bid Filter: From 100 Bids to a Top-5 Decision Matrix"
permalink: /portfolio/fh-bid-filter/
image: /portfolio/assets/images/fh-bid-filter/hero-0900x0530.png
---

## Overview

Active employers, web studios and agency leads posting projects on Freelancehunt routinely receive 60–120 bids within the first hour — 80% of which are generic templates or AI-generated walls of text that never addressed the actual brief. Reading every bid burns hours of a founder's or PM's time. **fh-bid-filter** is a safe, human-in-the-loop screening tool built specifically for Freelancehunt employers: it strips boilerplate fluff deterministically, scores every bid against your project brief, flags unrealistic pricing or missing answers to your screening questions, generates one surgical verification question to copy-paste, and turns 100 bids into a compact **Top-5 Decision Matrix**.

**Result: employers review a 5-row structured comparison table in 3 minutes instead of reading 100 repetitive essays — with zero automated bot messaging that could risk their platform account.**

---

## The Real Hard Part

Naive "AI detectors" falsely flag strong engineers who write concisely, while aggressive auto-messaging browser scripts risk getting an employer's Freelancehunt account restricted by anti-automation systems. The engineering problem is achieving 10x screening speed with **zero account risk**: strictly read-only analysis of the bids already visible in the employer's browser (or exported snapshot), deterministic fluff-stripping before any LLM scoring, and human-triggered 1-click follow-up questions instead of unattended chat automation.

---

## How It Works

1. **Zero-risk read-only capture.** Works as a lightweight local tool / Chrome side panel reading only the bids already loaded on the employer's active Freelancehunt project page — never stores platform passwords, never sends automated background messages.
2. **Deterministic fluff stripping & brief check.** Strips standard greetings and self-praise templates, extracts concrete numbers (price, days, links, tech terms), checks whether the bidder answered any explicit screening/canary question in the brief, and computes a signal-density score at zero LLM cost.
3. **Structured Top-5 Decision Matrix.** Runs compact structured LLM scoring only on bids that pass the deterministic threshold — producing a single comparison table: bidder, price vs median, timeline, key technical insight, red flags, and a 1-sentence verdict.
4. **1-click surgical follow-up question.** Generates one sharp, project-specific technical trade-off question (Cognitive Proof-of-Work) for the employer to paste manually to the top 3–5 finalists; when they reply, the tool compares their answers side by side.

---

## Key Decisions

| Decision | Why |
|---|---|
| Strictly read-only, zero auto-messaging | Protects the employer's Freelancehunt account 100% — the human clicks send on 3–5 finalists, never an automated script blasting 80 chats. |
| Deterministic pre-filter before LLM scoring | Cuts 60–70% of empty template bids instantly without spending LLM tokens on generic "ready to start" spam. |
| Decision Matrix instead of chat summaries | Compares price, days, portfolio relevance, brief alignment and risks in one scannable table. |
| Canary / screening question detector | Automatically highlights who actually read the brief vs who pasted a blind template. |

---

## What You Get

- Custom Freelancehunt bid-screening utility (Chrome side panel or local web dashboard) configured for your hiring criteria and budget ranges
- Deterministic fluff-filter, brief-alignment scorer and automated Top-5 Decision Matrix export (web view / CSV / Notion / Telegram)
- Generator for surgical technical follow-up questions tailored to each project's stack and risks
- Setup guide and zero-risk usage checklist for your PMs and agency leads

---

## Boundaries

- Intentionally does **not** perform unattended automated messaging or scraping against Freelancehunt; it operates strictly as a local read-only decision assistant for the employer.
- Designed for agencies, studios and repeat employers hiring regularly across multiple projects.

---

## Stack

`TypeScript / Chrome Extension` · `Go / Python` · `OpenAI / Claude / OpenRouter Structured Outputs` · `Deterministic Fluff-Stripping` · `Decision Matrix UI` · `CSV / Notion / Telegram Export`
