---
layout: post
title: "Inverting the Asymmetry: Why AI Detectors Are Dead, and How to Make Spammers Pay With Their Time"
date: 2026-09-09
permalink: /blog/2026/09/09/cognitive-proof-of-work/
category: methodology
tags: [ai, spam, security, hiring, methodology, engineering, automation, llm]
lang: en
description: "AI detectors lose the arms race by construction. A working answer to spam bids, PRs, resumes, and tickets — Cognitive Proof-of-Work: trade generation cost for interaction cost."
excerpt: "The cost of synthesizing plausible-looking content has collapsed to near zero, while the cost of verifying it stayed stubbornly human, slow, and expensive. This isn't abstract theory — it's a concrete architectural problem, and the fix isn't better detection. It's changing the protocol."
image: /assets/images/posts/cognitive-proof-of-work/1-en.png
---

*Valentyn Solomko · September 2026*

> **One-line thesis:** AI detectors lose the arms race by construction — the fix isn't better text classification, it's inverting the cost asymmetry: making interaction with a submission more expensive for the generator than for the genuine practitioner.

---

*This piece is for technical leads drowning in code review for endless AI-generated Pull Requests; HR managers and recruiters buried under "Easy Apply" submissions; open-source maintainers and security teams triaging bug reports and vulnerability disclosures; procurement managers reading tender proposals; freelancers and clients on platforms like Freelancehunt or Upwork — in short, for anyone holding an open inbound channel (an email address, an application form, an issue tracker) who already feels they're reading more synthetic noise than substantive replies. This is about why that happened, and what to do about it, engineering-wise.*

---

The world has run into a fundamental economic anomaly: the cost of synthesizing plausible-looking content has collapsed to near zero, while the cost of verifying it stayed stubbornly human, slow, and expensive.

When generating a piece of text, code, or a proposal required hours of focused work, the market was regulated by a natural cost barrier. A spammer, a corner-cutter, or an unqualified applicant was checked by the hard physical limit of their own time. Cheap LLM APIs removed that fuse. The result has been a collapse of inbound channels everywhere open communication exists — from freelance bid boards and GitHub's PR tree to corporate hiring.

---

## The 2000-line syndrome: why PR hell in engineering is inbox spam's twin

In engineering, the synthesis crisis has already shown itself in full through the wave of uncontrolled "vibe coding."

It used to be that a developer spent a week designing and writing a feature, packaged it into 150 thoughtful lines, and a tech lead spent 20 minutes reviewing it. Today a junior, or a founder in a hurry, uses a modern AI assistant to generate 2000 syntactically flawless lines in forty seconds. The code compiles, the basic tests are green — but buried inside are hidden race conditions, inefficient database queries, and hallucinated third-party dependencies.

Review turns into hard labor. To dig out one critical side effect in a giant monolith, a senior engineer has to burn half a day of cognitive effort.

This is the classic **Brandolini's Law (the Bullshit Asymmetry Principle)** at work: *the amount of energy needed to refute nonsense is an order of magnitude larger than the energy used to produce it*. By 2026, everyone holding an open inbound channel has become the exhausted tech lead, buried every minute under a fresh synthetic "2000-line PR."

---

## Recruiting on fire: how Easy Apply and ATS broke the hiring market

Corporate hiring has become a mirror of the same collapse. Thanks to extensions like LazyApply and mass-apply scripts, candidates now fire off hundreds of applications an hour with one click.

* **The collapse of keyword matching:** Companies tried to defend themselves with classic ATS keyword filters. In response, candidates pointed LLMs at the job postings: the model adapts every resume and cover letter to the specific listing closely enough that the ATS reports a 100% match.
* **The toxic-barrier trap:** Once recruiters were drowning in 1,000 applications per posting, they tried brute-force countermeasures: pointless unpaid six-hour take-home assignments, or demands for a three-minute Loom video.
* **Adverse selection:** The result has been catastrophic. Experienced engineers who already have a job and respect their own time simply close the tab. There's no point clearing a bureaucratic obstacle course for a chance to talk to a recruiter. Meanwhile spam generators happily delegate the take-home test to an agent or copy a ready-made solution from the web.

The screening system has broken: it filters out the best candidates and lets through the most adaptive spammers.

---

## The vague-brief trap: TDD for communication

Before blaming the bots, clients and hiring managers should look at their own wording. A vague, generic request is the single biggest magnet for synthetic noise.

When a recruiter posts a listing that reads *"Looking for a rockstar who writes clean code in a fast-paced startup,"* or a client on a freelance platform writes *"Need to finish up the site and set up an integration,"* they're creating a vacuum with their own hands.

* For a language model, that vacuum is home turf. It instantly produces three screens of empty but flawless prose about "a tailored approach, a commitment to quality, and relevant background."
* For a real practitioner, that same description is a red flag. There's no way to assess architecture, risk, or timeline from zero specifics. A professional just skips the listing.

In engineering, you can't write a meaningful unit test until an architect has defined the interface and behavioral contract. **A canary question can't be formulated without the asker doing their own Proof-of-Work first.**

Trying to bolt a filter onto a vague brief turns into theater: *"Start your application with the word giraffe,"* or the equally bland *"What is polymorphism?"* Bots sail past these instructions via system prompts, while real people read them as disrespect. If whoever posted the task can't decompose their own pain down to one concrete engineering point, no tool will save them from the noise.

---

## Why naive fixes and AI detectors lose by construction

A common instinct is "put an AI detector at the front door" or "point our own LLM at every incoming submission." Both are dead ends.

* **Classifiers are mathematically doomed:** Text detectors (scoring perplexity and word-frequency patterns) are chasing a moving target — models get more human-sounding every month. Worse, detectors carry a critical false-positive rate: a senior engineer's dry, precise, economical writing routinely gets flagged as "machine-generated," filtering out exactly the people the business is trying to find.

* **Analytical LLM gateways just double the cost:** If you run 100 spam submissions through your own paid model to screen them, you're spending your own token budget re-reading garbage the spammer generated for pennies. The asymmetry still favors the attacker.

---

## The paradigm shift: Cognitive Proof-of-Work

The way out isn't a better text classifier — it's a different interaction protocol. This is a return to the idea behind **Hashcash**, proposed by Adam Back in 1997 to fight email spam: *make the sender's computer compute a hash before the message can be sent*. For an ordinary person, one second of CPU time is invisible; for someone blasting out millions of messages, it's instant computational bankruptcy.

By 2026, compute has gotten cheap, but **live human expertise and focused attention have become the scarcest, most expensive resource**. What's needed is **Cognitive Proof-of-Work**.

Most spam pipelines are stateless scripts: *Event → Prompt → Submit*. They hold no state, carry no awareness of a deepening conversation, and are built for volume.

The defense mechanism works like a **"CI/CD pipeline for inbound messages"**:

1. **A gate at the entrance:** no human should open an application, a resume, or a ticket until the sender has cleared a basic compile-time check.
2. **One canary question:** the gate returns a single, narrow, domain-specific situational question tied to a real sharp edge of the actual project.
3. **A hard TTL (time-to-live):** a short, fixed window to answer (say, 15–20 minutes).
4. **Asymmetric response cost:** the question is worded so an expert spends 40 seconds typing two sentences off the top of their head, while a bot either produces three pages of boilerplate essay or stalls waiting for a human operator and blows the deadline.

![Cognitive Proof-of-Work gateway: a submission passes through an automated gateway, one canary question with a deadline, and only a concise, on-time, on-point answer reaches the shortlist](/assets/images/posts/cognitive-proof-of-work/1-en.png)

---

## Applicability check: when the mechanism works, and when it doesn't

Before porting Cognitive Proof-of-Work into a new domain, check four conditions hold at once — not three out of four, all four:

1. The cost to generate a submission/report approaches zero, while the cost to read and evaluate it is real human time.
2. There's one narrow, domain-specific question, cheap to answer for someone who genuinely knows the domain and expensive or invisible to a generate-and-forget pipeline.
3. The cost of a false rejection is acceptable.
4. The value of a single interaction is high enough to justify a bespoke, case-specific question.

Condition three isn't a formality. In freelancing or recruiting, a false rejection means one lost lead — annoying, but cheap. In bug bounty triage, the error cost runs the *opposite* direction: a false negative — a real vulnerability report dismissed because the researcher couldn't produce a PoC inside a 15-minute window — is a real security risk, not an inconvenience. So in domains where the error is expensive, a hard TTL-rejection should become a soft de-prioritization ("answer incomplete — flagged low-priority, pending manual review") rather than an automatic close with no human in the loop.

When all four conditions hold, the mechanism transfers almost 1:1 across domains — only the wording of the canary question changes.

---

## The architectural boundary: sanctioned gateways vs. someone else's UI

Technically, it's critical to distinguish *where* the automation is deployed. Building an "anti-bot" as a client-side browser script against a third-party closed platform (Freelancehunt, Upwork, LinkedIn) runs into a sharp risk asymmetry.

* Platforms aggressively defend their own interfaces: security systems block sessions even at the level of passive HTTP requests via Cloudflare TLS/JA3 fingerprinting, and behavioral detectors quickly flag autoclicker activity inside chat threads.

* When an engineer runs a scraper against their own account, they're the one taking the risk. But if you get a client to install an extension that automatically interacts with candidates inside the marketplace, it's the client's account that eats a lifetime ban. No amount of timing jitter or human-behavior mimicry reliably beats modern platform session analysis.

The defense works reliably only where you control the channel, or use an official API:

* **ATS webhooks (Greenhouse, Lever) and corporate email:** a candidate submits → a webhook fires the canary email → the response gets scored. Zero risk to any account, fully transparent process.

* **GitHub Actions:** issue and PR triage through the official API, protecting open-source maintainers.

* **Your own B2B forms and tender portals.**

This boundary runs through every domain equally sharply — not just the three named above. The full picture:

| Domain | Ban risk | Market breadth |
| --- | --- | --- |
| Freelance platforms (Freelancehunt, Upwork) | 🔴 high — someone else's UI, someone else's account | narrow, low budget per case |
| Recruiting **through LinkedIn's own UI** | 🔴 high | — |
| Recruiting **through ATS/email** | 🟢 none | 🟢 widest market of all |
| OLX / marketplace listings | 🔴 high | wide by headcount, near-zero willingness to pay |
| B2B RFP / procurement | 🟢 none (client's email/portal) | 🟢 wide, long enterprise sales cycle |
| VC pitch decks | 🟢 none (fund's email/form) | 🟡 narrow, very well-funded |
| GitHub Actions (issue triage) | 🟢 none (official API) | 🟡 niche |
| Bug bounty triage (HackerOne/Bugcrowd API) | 🟢 none (official API) | 🟡 niche, generous security budgets |
| Guest post / PR pitches | 🟢 none (editor's email) | 🟡 medium |
| Peer review / academia | 🟢 none (email/editorial process) | wide by headcount, near-zero budget |

The pattern is the same in every row: risk is set not by how sophisticated the automation is, but by whether the channel belongs to you, or to someone else's UI on someone else's account.

---

## A practical framework: 4 rules for the canary question

For the filter to avoid becoming a toxic obstacle itself, it needs to follow four engineering principles:

1. **A dilemma, not an encyclopedia entry.** The question shouldn't test definitions. It should force a choice between two concrete alternatives:

   *Bad:* "What transaction isolation levels do you know?" (an LLM will happily generate a five-page lecture).
   *Good:* "We have a 100M-row table, 99% inserts, 1% range-scan selects by date. Which index creates more disk overhead here: a hash index or a B-tree? One sentence."
2. **Timing analysis.** A three-second answer with a wall of text is an automated script. A twelve-minute wait followed by two concrete lines is a real engineer who actually read the context and formed an opinion.
3. **Fluff-stripping / structure detection.** Template-driven bots can't write tersely when directly asked about a technical tradeoff. If, after stripping greeting boilerplate and generic filler, 5% of the content remains, the applicant drops to the back of the queue.
4. **Contextual respect.** The message shouldn't read like a bureaucratic interrogation. It should be phrased as coming from a technical lead who respects the candidate's time and gets straight to the engineering substance.

---

## The death of the open inbox: protocols instead of spam filters

The concept of an open inbound channel — an open email address, a public inbox on a marketplace, a public Easy Apply button — no longer works as a stable model. Any open digital touchpoint with no feedback-cost mechanism will get buried under terabytes of plausible synthetic noise.

The internet is splitting into two spaces: an open "free noise zone," where models will keep talking to other models indefinitely, and "verified channels," protected by Cognitive Proof-of-Work protocols.

The winner isn't whoever manages to teach an AI to tell human words from machine words. It's whoever builds an architecture where generating noise becomes economically unprofitable again.

---

Systems like this aren't abstract theory — they're a concrete engineering problem at the intersection of backend architecture, event queues, and AI orchestration. I'm **Valentyn Solomko**, and I specialize in designing distributed systems, backend engineering (Go, Java, TypeScript), and integrating AI agents into real business processes.

If your team or company is drowning in synthetic inbound noise — whether that's ATS-driven recruiting, a growing backlog of bug reports, or a flood of inbound B2B requests — I can help design and build a reliable solution:

* Build legitimate **agentic screening gateways** on official APIs and webhooks, with no account-ban risk.
* Design deterministic **inbound validation pipelines** (from canary-question architecture to response-structure analysis).
* Optimize and protect your communication infrastructure, saving hundreds of hours of your senior team's expensive attention.

Open to discussing the technical details of your specific case: [my portfolio](/portfolio/)

A concrete application of this approach to freelance bid screening: [bid-triage](/portfolio/bid-triage/).
