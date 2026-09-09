---
layout: portfolio-item
title: "bid-triage — AI Bid-Noise Filter, Built to Order"
permalink: /portfolio/bid-triage/
image: /portfolio/assets/images/bid-triage/bid-triage-en.png
---

## Overview

A bespoke engagement, not a packaged product: a bid-screening system for a freelance-platform client drowning in AI-generated proposals. Instead of trying to classify "AI-written" text — an arms race that structurally favors the generator over the detector — it inverts the cost asymmetry that makes bid spam cheap in the first place, and shortlists the small number of bidders who can actually engage with the specific job.

**Approach: don't detect authorship, price it. A one-line, deadline-gated technical question costs a generic pipeline nothing to fail and costs a real practitioner ten seconds to pass — that gap is the filter.**

---

## The actual hard problem

Generating and sending 100 bids costs a spammer pennies and seconds; reading and filtering them costs the hiring party an hour and their patience. That asymmetry, not "AI vs. human," is the real problem — a client who used an LLM to write a clear, correct, on-topic bid shouldn't be penalized for the tool, and a text classifier can't reliably tell the difference anyway (detection quality trails generation quality by construction). The target has to be *irrelevance*, not *authorship*: does this bid demonstrate real understanding of this specific job, or is it a plausible-sounding template that would fit a thousand other postings just as well.

---

## How it works

![bid-triage funnel: a deterministic fluff-strip filter, a signal gate, one deadline-gated canary question, and a shortlist for a human decision](/portfolio/assets/images/bid-triage/bid-triage-en.png)

Two gates, in order of cost. First, a deterministic pass strips ritual phrasing ("happy to help", boilerplate credentials) and scores what's left for actual technical density — no LLM call spent on a bid that's mostly filler. What clears that floor gets exactly one canary question: a narrow, tradeoff-shaped question tied to the job's own constraints ("the external API caps at 2 rps — would you queue that, or is an in-process worker pool enough here?"), with a hard reply deadline. A generic pipeline answers with a hedged essay covering both options; a practitioner answers in one line and takes a side. Only bids that clear both gates reach the shortlist — a human still makes the final call, on a handful of candidates instead of a hundred.

---

## Key Decisions

| Decision | Why |
|---|---|
| Price the interaction, not the authorship | Text classifiers lose the arms race by construction — generation quality moves faster than detection quality. A deadline-gated exchange shifts the cost back onto whoever is bidding, the same principle behind a CAPTCHA, applied to a short technical exchange instead of a perception task. |
| Deterministic filter before any LLM call | Most of the noise is boilerplate; stripping it and scoring the remainder needs no model call at all, so the expensive step only runs on bids that already cleared a cheap bar. |
| One surgical question, not an interrogation | A multi-round questionnaire drives away over-committed senior candidates who'd rather just talk to a human. One sharp, job-specific tradeoff question filters just as well without the friction. |
| Runs inside the client's own account, deliberately lean | Every message sent carries the client's own platform-account risk, not a vendor's — so the engagement is scoped to stay conservative: few iterations, starting from the highest-signal bids first, no aggressive automation posture. |
| Bespoke per client, not a shared SaaS | Validated against one real account and one real hiring problem before any thought of generalizing — the platform-risk profile and the shape of "signal" both depend on the specific job, so a one-size-fits-all product would either be too aggressive for some clients or too weak for others. |

---

## What a delivered engagement typically includes

- The fluff-strip filter and canary-question logic tuned to the client's own job postings and hiring bar
- A shortlist view — a compact summary per surviving candidate, not a wall of unread bid text
- A conservative interaction budget agreed with the client up front, sized to their platform's own anti-automation posture

---

## Stack

`Go` · LLM structured-output parsing · deterministic pre-filtering · session-based browser automation — the specific mix depends on the target platform.
