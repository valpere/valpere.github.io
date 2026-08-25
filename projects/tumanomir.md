---
layout: project
title: Tumanomir — Specification-Precision Measurement for AI-Driven Projects
permalink: /projects/tumanomir/
exclude: true
lang: en
lang_alt: /uk/projects/tumanomir/
---

# Tumanomir — Measuring the Fog Before AI Agents Turn It Into Architecture

**Links:**

- [GitHub](https://github.com/valpere/tumanomir)
- [Deep-dive article](/blog/2026/07/28/tumanomir/)

![Tumanomir — command flow](/projects/assets/images/tumanomir/command-flow-1-0784x0420.png)

**Туманомір** — a Go CLI that digitizes the "fog" of specifications before
you let AI agents turn that fog into architecture. It's the reference
implementation of the *Source of the Unknown* methodology: specs consumed
by AI agents are not sources of truth but distributions over possible
implementations, so the tool measures the spread instead of assuming it
away.

---

## The Problem

Handing a spec to an AI coding agent and getting back five subtly
different implementations is a familiar experience, but "subtly
different" has no number attached to it. Tumanomir gives it one: how
traceable are the requirements, how dense are the machine-readable
constraints, and how far apart do independent generations from the same
spec actually land.

---

## Metrics

| Metric | Layer | What it measures |
| --- | --- | --- |
| `K_drift` | deterministic | requirements without `[REQ-*] -> [FUN-*]` trace edges (trace-markup coverage, not implementation correctness) |
| `D_const` | deterministic | lexical density of machine-readable constraints (advisory-only, never blocks the gate) |
| `D_pair` | stochastic (LLM) | 1 − mean pairwise AST similarity of N generations |
| `H_norm` | stochastic (LLM) | cluster entropy / log₂N — ordinal signal only |

The deterministic layer needs no LLM and runs as a git hook, instantly.
The stochastic layer generates N Go artifacts from the spec via a fixed
instrument (Ollama) and measures how far apart they land — the wider the
spread, the foggier the spec.

---

## CLI

```bash
tumanomir check docs/                 # deterministic, instant, no network
tumanomir measure spec.md --instrument ollama:qwen3-coder:30b -n 10 \
  --temp 1.0 --sim-threshold 0.95 --num-ctx 8192 --num-predict 2048
tumanomir gate spec.md --instrument ollama:qwen3-coder:30b -n 3 \
  --num-ctx 8192 --num-predict 2048   # both layers, for CI
tumanomir calibrate corpus.jsonl      # Spearman correlation vs. a labeled corpus
tumanomir label <hash-or-prefix> <score>  # the sole writer of a corpus outcome
```

`check` runs deterministically and instantly. `measure`/`gate` require an
explicit `--instrument` (backend:model) and `--num-ctx`/`--num-predict` —
`gate` refuses to silently downgrade to deterministic-only if a
temperature is passed but no instrument resolves, since a silent
degradation would be a measurement-integrity bug, not a convenience.
`--format json` on `check`/`measure`/`gate` gives a single compact JSON
object for CI parsing.

Sample deterministic run, from Tumanomir dogfooding its own spec:

```
$ tumanomir check docs/requirements.md
  K_drift:  0.00  [ok]     (threshold 0.20, 0/33 requirements untraced)
  D_const:  0.03  [warn]   (threshold 0.35, 101 markers / 3905 prose tokens)
  D_pair:   —     (stochastic layer: run `tumanomir measure` with an instrument)
```

All stochastic measurements are **instrument-relative**: results are
reported together with the full instrument configuration and are not
comparable across models without recalibration.

---

## Architecture That Earns Trust, Not Just Correctness

The deterministic packages (`internal/metrics`, `internal/spec`,
`internal/config`, `internal/calibrate`) are barred from touching the
network — not as a convention, but as a test (`TestNoNetworkImports`)
that fails CI if a `net/*` import ever creeps in. That's what makes
`check` and `calibrate` safe to run as a git hook or in air-gapped CI.

`D_const` is architecturally incapable of blocking the gate
(`REQ-CHK-06`) — it's fixed in code as a tested invariant, not left as a
caveat in documentation that could be forgotten under deadline pressure:
it's a lexical proxy, not ground truth on specification precision.

The $K_{drift}$ scanner was rewritten from `regexp` to a hand-written
byte scanner (PR #68), cutting allocations from scaling with requirement
count to a flat 14 allocs/op — a full `check` on a 1MB spec completes in
16.7ms, well within a 100ms budget.

---

## Tech Stack

- **Go 1.26** — single binary, one external dependency (`gopkg.in/yaml.v3`)
- **Ollama** — pluggable instrument backend for the stochastic layer
- **Cobra**-style CLI, `.tumanomir.yaml` for optional config defaults

---

## Status

v0.1: `check`, `measure`, `gate`, `calibrate`, and `label` are all
implemented and work end-to-end — 66 commits, 64 merged PRs, zero
reverts over 25 days of development. No tags exist yet; the version is
honestly marked `-dev`, not claimed as a release.

**What's still open, by the project's own account:** no real labeled
corpus exists yet for `calibrate` to correlate against, so the default
thresholds (0.20 / 0.35 / 0.30) remain hypotheses, not calibrated
numbers. `D_pair` is instrument-relative — the same spec, same
instrument, and three consecutive runs produced verdicts ranging from
"ok" to "block". A single instrument (Ollama, `qwen3-coder:30b`) has
been tested; OpenAI/Anthropic backends aren't built. Only one projection
(Go type definitions) is implemented, so v0.1 is Go-specific. The full
[deep-dive article](/blog/2026/07/28/tumanomir/) walks through the
evidence, the benchmarks, and an honest "ladder of claims" table
separating what's proven from what's still a hypothesis.

Open source, Apache 2.0 licensed.

🔗 <https://github.com/valpere/tumanomir>
