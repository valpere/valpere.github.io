---
layout: portfolio-item
title: "Tumanomir — CLI for Measuring AI-Spec Ambiguity"
permalink: /portfolio/tumanomir/
image: /portfolio/assets/images/tumanomir/tumanomir-en.png
---

## Overview

Independent R&D project: a Go CLI that turns "the spec is unclear" from a vague complaint into three measurable metrics an AI coding agent's context can be gated on before it writes a line of code.

The methodology was published first — [Source of the Unknown](/blog/2026/07/04/source-of-the-unknown/) proposed $K_{drift}$ (untraced requirements), $D_{const}$ (constraint density), and $D_{pair}$ (generation spread across N samples) as a way to price ambiguity like an engineering tolerance, not a feeling. Tumanomir is the reference implementation: **25 days, 66 commits, zero reverts**, gating its own specification in CI from day one.

**Result: a working `check`/`measure`/`gate`/`calibrate`/`label` pipeline, with every claim in the follow-up article backed by a real, reproducible CLI run — not a retelling.**

---

## What Shipped

```
$ tumanomir check docs/requirements.md
  K_drift:  0.00  [ok]     (threshold 0.20, 0/33 requirements untraced)
  D_const:  0.03  [warn]   (threshold 0.35, 101 markers / 3905 prose tokens)
  D_pair:   —     (stochastic layer: run `tumanomir measure` with an instrument)
```

Five commands, each demonstrated against the tool's own live spec:

- **`check`** — deterministic layer, no network, ~17ms on 1MB
- **`measure`** — stochastic layer against a real Ollama instrument (N generations, structural AST diff)
- **`gate`** — both layers combined for CI, refuses to silently degrade when `--temp` is passed without a resolved instrument
- **`calibrate`** — Spearman correlation of metric values against outcome labels, from a corpus, never re-measured
- **`label`** — the single command allowed to write a corpus row's outcome

---

## Architecture

```
spec.md ──► check (K_drift, D_const)  ─┐
        └─► measure (D_pair, instrument) ─┴─► gate ──► exit 0/1 (CI)
                                                │
corpus.jsonl ──► calibrate (Spearman) ◄────────┘
```

The deterministic packages (`internal/metrics`, `internal/spec`, `internal/config`, `internal/calibrate`) have no right to touch the network — enforced by a test that parses their transitive dependencies and fails if `net/*` shows up, not by a comment someone can forget under deadline pressure.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Hand-written byte scanner over `regexp` for $K_{drift}$ | 3260 → 14 allocations/op, independent of requirement count — full `check` on 1MB fits in 16.7ms |
| $D_{const}$ architecturally cannot block the gate (`VerdictBlock`) | It's a lexical proxy, not ground truth — advisory-only by design, fixed as a tested invariant, not a caveat |
| `PromptV1` as a named, versioned Go constant | Reproducibility — the generation prompt is never an inline literal that can silently drift |
| Spearman, not Pearson, in `calibrate` | `outcome` is an arbitrary caller-defined scale; only the monotonic relationship is meaningful |
| No embedding-based synonym matching for naming noise | Explicitly rejected — it would reintroduce model non-determinism into a metric whose whole value is being a fixed, reproducible instrument |

**The finding that mattered most:** a test isolating naming noise from structural divergence showed identifier choice alone can produce $D_{pair} = 0.6667$ on a fixed structure — two-thirds of the similarity signal near the blocking threshold can be how a model names a variable, not how it understood the spec. Recorded as a measured, open Phase-2 question rather than smoothed over.

---

## Results

- **66 commits, 64 merged PRs, zero reverts** over 25 days
- **v0.1.0-dev, feature-complete** — 5 commands working end-to-end, no external dependency besides `gopkg.in/yaml.v3`
- **`make dogfood`** gates the tool's own spec in CI on every change
- **233× fewer allocations** in the $K_{drift}$ scanner after a targeted rewrite (PR #68)
- Every CLI output quoted in the published follow-up article was re-run against the live binary before publishing — not transcribed from memory

Code: [github.com/valpere/tumanomir](https://github.com/valpere/tumanomir) · Write-up: [Source of the Unknown](/blog/2026/07/04/source-of-the-unknown/) → [Tumanomir](/blog/2026/07/28/tumanomir/)

---

## Stack

`Go` · `Ollama` (qwen3-coder:30b instrument) · `AST-based structural diff` · `Spearman correlation` · `YAML config` · `GitHub Actions CI`
