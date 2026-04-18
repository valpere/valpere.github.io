---
layout: post
title: "Vibe Coding Without Vibes: Keeping Engineering Standards While Using AI"
date: 2026-03-01
permalink: /blog/2026/03/01/vibe-coding-methodology/
category: methodology
tags: [ai, methodology, vibe-coding, claude, cursor]
lang: en
description: "Why AI-assisted development needs the same engineering discipline as hand-written code — and the practices that keep it maintainable."
excerpt: "Vibe coding — the practice of describing what you want and letting an AI generate the implementation — is real and productive. It is also a reliable way to accumulate technical debt at AI speed if you treat the AI as a replacement for engineering discipline rather than an accelerant."
image: /projects/assets/images/vibe_coding/vibe_coding-1-0768x0512.png
---

![Vibe coding with AI tools](/projects/assets/images/vibe_coding/vibe_coding-1-0768x0512.png)

Vibe coding — the practice of describing what you want and letting an AI generate the implementation — is real and productive. It is also a reliable way to accumulate technical debt at AI speed if you treat the AI as a replacement for engineering discipline rather than an accelerant.

The issue is not the AI. The issue is that the habits that make hand-written code maintainable do not enforce themselves just because you switched to prompted code.

## YAGNI Still Applies

AI models are trained to be helpful. When you ask for a user authentication system, a helpful model will often give you authentication plus password reset, plus session management, plus an admin flag on the user model, plus email verification — because those things often go together and the model is pattern-matching on codebases where they do.

This is YAGNI violation at generation speed. You did not ask for those things, you do not need them yet, and now they are in your codebase requiring maintenance, testing, and decision-making.

The fix is specificity in prompts. "Implement JWT authentication — just the middleware that validates a token and sets a context value, nothing else" produces a dramatically different result than "implement authentication."

## Specs Before Code

The most productive use of AI in development is not asking it to figure out what to build. It is asking it to build a thing you have already figured out. This means writing a spec first.

A spec does not need to be elaborate. For a single task it might be four bullet points:

```
- Accept a POST /webhooks/stripe body
- Validate the Stripe-Signature header using STRIPE_WEBHOOK_SECRET from env
- On payment_intent.succeeded, call OrderService.MarkPaid(paymentIntentID)
- Return 200 on success, 400 on invalid signature, 500 on internal error
```

That spec constrains the AI to what you actually want. Without it, the model will make choices — about error handling, about what to log, about whether to add a retry queue — and some of those choices will be wrong for your context.

## Review Still Matters

AI output requires the same code review scrutiny as output from a junior developer. The AI does not know your conventions, your security model, or what you decided last sprint. It knows common patterns, which is not the same thing.

Things to specifically look for in AI-generated code:

- **Invented abstractions.** A function that was supposed to fetch a user instead returns a result type with three fields, two of which you did not ask for and one of which shadows a name in an outer scope.
- **Inconsistent error handling.** The happy path is fine; the AI often gets bored with error handling and uses a different pattern for the third error case.
- **Missing input validation.** AI will validate inputs that appear in its training data for similar functions. It will skip validation for inputs that seem "internal" to the application.
- **Silent failure modes.** Goroutines that panic without recovery, channels that can deadlock, contexts that are not propagated.

## The Subagent Pattern

One long conversation with an AI is a trap. The model's context window fills with earlier decisions, and later outputs are implicitly constrained by them — including bad decisions made early that were never corrected.

The subagent pattern: one task, one fresh context, one review. Isolate each task into a focused prompt that includes everything the AI needs and nothing it does not. This produces more predictable output and makes it easier to review because the scope is bounded.

In practice this means using `git worktrees` per task and invoking a new Claude Code session per worktree. The overhead is low; the predictability gain is significant.

## When Not to Use AI

There are categories of code where AI assistance is actively harmful:

**Security-sensitive code.** Authentication flows, cryptographic operations, access control checks. These require getting the exact right thing right the first time. AI will produce plausible-looking code that has subtle flaws — timing attacks, missing validation in edge cases, incorrect use of a crypto primitive. Read the spec, implement it yourself, have a second human review it.

**Novel algorithms.** If the algorithm you need does not exist in common form in AI training data, the AI will approximate it with something that looks similar but is not correct. This is the worst failure mode: code that looks right, passes obvious tests, and fails in production on edge cases.

**Regulatory compliance logic.** Tax calculations, GDPR right-to-erasure implementation, financial rounding rules. The consequences of getting these wrong are not a debugging session; they are legal or financial exposure. Understand the spec yourself.

AI is a genuine productivity multiplier for the large majority of implementation work that is routine. The discipline is knowing which parts are not routine.
