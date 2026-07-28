---
layout: post
title: "Tumanomir: What Actually Got Built After \"Source of the Unknown\""
date: 2026-07-28
permalink: /blog/2026/07/28/tumanomir/
category: deep-dive
tags: [ai, ai-agents, specifications, engineering, llm, metrics, methodology, go, tumanomir]
lang: en
mathjax: true
description: "The engineering follow-up to Source of the Unknown: what got built in 25 days, what the tool measures for real, and what's still just a hypothesis."
excerpt: "A methodology is a hypothesis until something runs it against real specs and reports what broke. Tumanomir is that thing: three metrics, a 5-command CLI, and 25 days over which the tool started deterministically gating its own fog."
image: /assets/images/posts/tumanomir/1-en.png
---

*Valentyn Solomko · July 2026*

> **Thesis (one line):** A methodology is a hypothesis until something runs it against real specs and reports what broke. Tumanomir is that thing: three metrics, a 5-command CLI, and 25 days over which the tool started deterministically gating its own fog.

---

## Prologue: a promise that had to be kept

The article ["Source of the Unknown"](/blog/2026/07/04/source-of-the-unknown/) defined three metrics for digitizing the fog of specifications consumed by AI agents — $K_{drift}$ (untraceability), $D_{const}$ (constraint density), $D_{pair}$/$H_{spec}$ (generation spread) — and closed with an honest deferral:

> "Implementation details are the subject of a separate, purely engineering piece."

This is that piece. Over 25 days (July 3–27, 2026) the methodology turned into **Tumanomir** — a Go CLI, `v0.1.0-dev`, with no dependency besides `gopkg.in/yaml.v3` (for config parsing). 66 commits, 64 merged PRs (range #1–#114, not every number in between), zero reverts. Five commands work end-to-end. The tool **deterministically** gates its own specification in CI (`make dogfood` = `tumanomir check docs/requirements.md`) — the stochastic layer (`measure`/`gate` against Ollama) doesn't run in CI; that's a manual demonstration below. We're not claiming a release — no tags exist, the version is honestly marked `-dev` — but "stabilized" here means something concrete and checkable: feature-complete, green CI, not a single reverted PR the whole time.

This article is not a continuation of the Acts-style drama. The first article's reviewers were right: reflective prose carries a manifesto's voice, but an engineering report earns a calmer structure. So from here on: sections, not Acts.

![Tumanomir — command flow](/assets/images/posts/tumanomir/1-en.png)

---

## What shipped

Five commands, each demonstrated with real terminal output — not a paraphrase, a copy of an actual run.

### `check` — deterministic layer, instant, no network

```
$ tumanomir check docs/requirements.md
  K_drift:  0.00  [ok]     (threshold 0.20, 0/33 requirements untraced)
  D_const:  0.03  [warn]   (threshold 0.35, 101 markers / 3905 prose tokens)
  D_pair:   —     (stochastic layer: run `tumanomir measure` with an instrument)
```

This is dogfooding: Tumanomir measures its own specification (`docs/requirements.md`, written in its own traceable markup). This is a live run as of the day this article was written — the spec grows along with the project, so these numbers (33 requirements, 101 markers) are higher than the example in `README.md` (30 requirements, 95 markers): the README can't keep up with every PR. Tellingly, $D_{const}$ lands in [warn] here — 0.03, below the 0.35 threshold. The spec is full of rationale prose and "why" explanations, not bare schemas, and that's not a bug — it's exactly why $D_{const}$ is architecturally **incapable of blocking the gate** (REQ-CHK-06): it's a lexical proxy, not ground truth.

### `measure` — stochastic layer, at a fixed instrument

`measure` prints only the stochastic layer ($D_{pair}$/$H$/$H_{norm}$) — you see the deterministic $K_{drift}$/$D_{const}$ from `check` (above) or from `gate` (below), which does both.

```
$ tumanomir measure --instrument ollama:qwen3-coder:30b \
    -n 3 --temp 1.0 --sim-threshold 0.95 \
    --num-ctx 8192 --num-predict 2048 \
    docs/investigation/_sanity/specs/sharp.md

Instrument config (REQ-MSR-04):
  backend:        ollama
  model:          qwen3-coder:30b
  temperature:    1.00
  samples (N):    3
  think:          false
  num_ctx:        8192
  num_predict:    2048
  sim_threshold:  0.95
  prompt:         PromptV1 (276 bytes)

  D_pair:   0.21  [ok]     (95% CI [-0.00, 0.21]; threshold 0.30, mean sim 0.79, N=3 valid, 0 discarded)
  H:        1.58  bits (ordinal signal only, not gated)
  H_norm:   1.00  (ordinal signal only, not gated)
```

`PromptV1` is not a string literal — it's a named, versioned code constant:

```go
const PromptV1 = "You convert software specifications into Go type definitions. " +
  "Output ONLY one ```go code block containing: package declaration, " +
  "type definitions (structs, named types, consts) and function " +
  "signatures with empty bodies {}. No explanations, no comments, " +
  "no implementation logic."
```

We ran the same instrument with the same parameters **three times in a row**, against the same `sharp.md` — not because we were hunting for a specific result, but because we were gathering material for this article and repeated the run for different demonstrations (`measure`, then `gate --format json`, then `gate --explain` — three different CLI calls, the same instrument and input). The result is not one number, but a spread, and this is instrument noise, not a measurement bug:

| Run | Command | D_pair | verdict | mean_sim |
| --- | --- | --- | --- | --- |
| 1 | `measure` | 0.21 | ok | 0.79 |
| 2 | `gate --format json` | 0.31 | block | 0.69 |
| 3 | `gate --explain` | 0.42 | block | 0.58 |

At $N=3$ and temp=1.0 (a stress-test regime, not the working one — we'll come back to this), the same spec and the same instrument yield a verdict anywhere from "ok" to "block" depending on exactly when you hit Enter. $H$ and $H_{norm}$ stay stable (1.58 bits / 1.00) across all three runs — saturated at the $\log_2 3$ ceiling, i.e. discriminating nothing; it's $D_{pair}$ that discriminates, which is an argument in its favor as the working metric, not against measurement in general. The confidence interval at $N=3$ is also worth noting: `[-0.00, 0.21]` on run 1 — at that sample size it's practically useless, and that's one more reason not to read a single number as a final verdict.

This isn't a measurement bug — it's exactly the instrument property the first article warned about, now visible live instead of in a retelling. We'll return to it in "What's still unresolved."

### `gate` — both layers in one pass, for CI integration (given an instrument)

```
$ tumanomir gate --instrument ollama:qwen3-coder:30b -n 3 \
    --num-ctx 8192 --num-predict 2048 --format json \
    docs/investigation/_sanity/specs/sharp.md | jq '.result.measure.dispersion'

{
  "n": 3,
  "discarded": 0,
  "mean_sim": 0.6856951188405561,
  "d_pair": 0.3143048811594439,
  "d_pair_ci_low": 0,
  "d_pair_ci_high": 0.3143048811594439,
  "clusters": 3,
  "sim_thresh": 0.95,
  "h": 1.584962500721156,
  "h_norm": 0.9999999999999999
}
```

`--format json` is for CI parsing. But one detail deserves attention: `gate` refuses to silently degrade. If you pass `--temp` and no instrument resolves (no `--instrument`, no `.tumanomir.yaml` section), the command fails hard instead of quietly falling back to the deterministic layer:

```
gate: --temp was passed but no instrument resolved (no --instrument and
no .tumanomir.yaml instrument: section) — refusing to silently downgrade
to deterministic-only (REQ-GATE-02)
```

`--explain` classifies **which layer** failed and whether that failure is reproducible:

```
$ tumanomir gate --instrument ollama:qwen3-coder:30b -n 3 \
    --num-ctx 8192 --num-predict 2048 --explain \
    docs/investigation/_sanity/specs/sharp.md

⚠ D_pair blocked (stochastic — threshold breach under this instrument; a rerun may land differently)
  K_drift:  0.00  [ok]     (threshold 0.20, 0/3 requirements untraced)
  D_const:  0.11  [warn]   (threshold 0.35, 10 markers / 84 prose tokens)
...
exit code: 1 (gate failed)
```

"a rerun may land differently" isn't hedging for politeness. We just showed three runs with three different verdicts on the same input.

### `calibrate` — correlation against a historical corpus

`calibrate` never touches the network or calls an LLM — $D_{pair}$ is read from the corpus, never re-measured:

```
$ tumanomir calibrate corpus.jsonl

Calibration over 3 valid row(s), 0 skipped
⚠ fewer than 5 valid rows — correlation coefficients below are not statistically meaningful yet

K_drift   spearman=+0.00
  outcome <= median:  min=0.00 mean=0.00 max=0.00
  outcome >  median:  min=0.00 mean=0.00 max=0.00

D_const   spearman=-0.87
  outcome <= median:  min=0.00 mean=0.05 max=0.11
  outcome >  median:  min=0.00 mean=0.00 max=0.00

D_pair    spearman=+1.00
  outcome <= median:  min=0.19 mean=0.24 max=0.30
  outcome >  median:  min=0.55 mean=0.55 max=0.55

No threshold is auto-selected or written to .tumanomir.yaml — use these numbers to inform your own choice (REQ-NFR-03).
```

This isn't our real corpus — a real one hasn't accumulated yet (see below). This is a synthetic three-row example to show the mechanism works. Spearman, not Pearson: `outcome` is an arbitrary, caller-defined scale, so only a monotonic relationship is worth testing, and Spearman correctly degrades to the binary "clear vs. foggy" case through rank tie-handling.

### `label` — the sole writer of the outcome

`label <hash-or-prefix> <score>` is the single command that writes a corpus row's `outcome`, resolved by a `spec_hash` prefix (the way git resolves a short commit hash). No other command computes or guesses an outcome.

---

## Architecture that earns trust, not just correctness

### The network invariant of four deterministic packages

The deterministic packages (`internal/metrics`, `internal/spec`, `internal/config`, `internal/calibrate`) have no right to touch the network. This isn't a convention in a comment that's easy to break — it's verified by a test:

```
$ go test ./internal/ -run TestNoNetworkImports -v
=== RUN   TestNoNetworkImports
--- PASS: TestNoNetworkImports (0.05s)
```

The test parses the transitive dependencies of exactly these four packages and fails if `net/*` shows up anywhere. (This is not a global claim that "only `internal/instrument` may touch the network" — the test checks a specific list of packages, not the whole module.) This is what makes `check` and `calibrate` safe as a git hook and in air-gapped CI — not because we promised, but because the test (and, by extension, CI) will fail if someone tries to violate it.

### The rewritten $K_{drift}$ scanner: 233x fewer allocations

The first $K_{drift}$ implementation used `regexp` — and allocations scaled nearly 1:1 with requirement count (3260 allocs/op on a synthetic 1MB/~3400-requirement corpus). PR #68 rewrote it as a hand-written byte scanner:

```
$ go test ./internal/metrics/... -bench . -benchmem -run '^$'
BenchmarkKDrift1MB-16    5004    215091 ns/op   4875.62 MB/s    354885 B/op    14 allocs/op
BenchmarkDConst1MB-16      67  16237956 ns/op     64.58 MB/s   4177923 B/op     2 allocs/op
BenchmarkCheck1MB-16       63  16723453 ns/op     62.71 MB/s   4532803 B/op    16 allocs/op
```

14 allocations per operation — independent of requirement count. A full `check` on 1MB fits in 16.7ms, within the 100ms budget (REQ-NFR-01). This is exactly the "implementation note" from the first article, backed by concrete numbers on a real benchmark instead of a "microseconds per document" promise with no proof.

### `D_const` architecturally cannot block

REQ-CHK-06 fixes this explicitly in code, not just in documentation:

> $D_{const}$ is a lexical proxy, not a ground-truth measure of specification precision — it must never produce `VerdictBlock` (exit code 1) regardless of its value... This is advisory-only by design, not an oversight.

This is the same honesty as the first article ("the metric doesn't punish prose in general, only prose that isn't tied to a constraint") — only now it's fixed as a tested invariant, not a caveat that can be forgotten under deadline pressure.

---

## What we found that we didn't expect

### How much of $D_{pair}$ naming alone can eat: $0.6667$ on a fixed structure

PR #110 (July 26) added a test that isolates a specific question: how much of $D_{pair}$'s signal actually comes from structural divergence, and how much is just how the model names variables?

Three fixtures encode **one** structural interpretation of a small spec — a struct with two fields (int, string), a function, a constant — varying **only** identifier text. A control pair holds everything fixed, including names, reversing only field order:

```
$ go test ./internal/dispersion/... -run TestNamingNoiseDPair -v
=== RUN   TestNamingNoiseDPair
--- PASS: TestNamingNoiseDPair (0.00s)
```

The test by itself prints only PASS — it **asserts** the numbers, it doesn't log them. They're fixed as a comment and an assertion in the code (`internal/dispersion/naming_noise_test.go`), not as console output; we recomputed them separately (`Analyze()` on the same fixtures) to show this isn't a retelling:

```
naming-noise  D_pair = 0.6667  MeanSim = 0.3333  N = 3
reorder       D_pair = 0.0000  MeanSim = 1.0000  N = 2
```

Two-thirds of the similarity space is consumed by name choice alone when the structural interpretation is held fixed — on **this specific three-sample fixture**, not as a general claim about all possible specs. On empty-body Go type skeletons — `PromptV1`'s only generation target in v0.1 — this means a meaningful share of $D_{pair}$'s signal on this kind of input can be naming-style noise rather than structural divergence.

**What this means for the gate.** The current blocking threshold is $D_{pair} > 0.30$. If naming noise alone can produce 0.67 on an empty skeleton, then a "block" near the threshold doesn't necessarily signal structural ambiguity in the spec — it might just signal that two generations were named differently by the model. This doesn't make the metric useless (on live `sharp`/`fog` specs, $D_{pair}$ does discriminate between precise and foggy inputs — see the first article's sanity check) — but it does mean the absolute threshold for empty Go skeletons currently doesn't separate "the model named the fields differently" from "the model understood the structure differently." So this is an open Phase-2 question, not a side curiosity.

The test also documents two **explicitly rejected** ways to fix this — so they don't get proposed again:

- **Embedding-based synonym matching** — reintroduces a non-deterministic model dependency into a metric whose value is precisely that it's a fixed, reproducible, no-additional-LLM instrument.
- **Levenshtein distance** — not a model dependency, but it catches morphology/typos, not synonyms: `UserID`, `ID`, `Identifier` have a large edit distance despite being exactly the naming variance we're measuring here.

The number is fixed as input for a future "Phase 2: yes/no" decision on an additional, non-gating diagnostic $D_{pair\_shape}$ (with canonicalized field names) — that decision is **not** made by this test. The test only measures and pins the baseline.

---

## What's still unresolved

The first article closed with a "ladder of claims" — separating what's proven from what's hypothesis. We hold to that same standard here, and this section matters as much as the list of what worked.

**There's no real labeled corpus.** `calibrate` exists and works (demonstrated above), but the corpus doesn't. `session-indexer` and `ragivka`, the two real projects from the first article, haven't started accumulating rows yet. The threshold values (0.20 / 0.35 / 0.30) remain hypotheses from the first article, not calibrated numbers.

**$D_{pair}$ belongs to the instrument, not the document.** We just showed this live: the same spec, the same instrument, three runs — a spread of 0.21–0.42. The first article required a calibration-baseline protocol and a $\Delta H$ against it, measured at a working temperature (0.3–0.5), not the stress-test one (1.0). v0.1 does neither:

> v0.1's default temperature is 1.0, and D_pair is gated as an absolute value against 0.30, not as a delta against a calibrated baseline measured at working temperature. This is a deliberate, temporary simplification pending the `calibrate` roadmap item, not a silent methodology change.

This is a declared (REQ-CFG-01), not hidden, divergence — but it means the current gate measures something a little different from what the first article described.

**$D_{const}$ remains a lexical proxy.** The full RFLP graph (Neo4j) from the first article hasn't been built. The current metric is markers-vs-prose, not a structural graph walk.

**$K_{drift}$ is strict-mode only.** Assisted mode (an LLM parser for specs without markup) isn't implemented — and implementing it would cost determinism by definition: the deterministic layer (REQ-CHK-01..06) requires zero LLM in the loop.

**A single instrument.** `instrument.Generator` is already a pluggable interface, but it's only been tested against Ollama. OpenAI/Anthropic backends aren't built, aren't tested.

**Only one projection.** `measure` only generates Go type definitions (`PromptV1`). SQL DDL, OpenAPI — other projections from the first article's roadmap — aren't implemented; v0.1's applicability is limited to Go projects.

**The "copy-floor" isn't universal.** In the source experiment, feeding the model already-complete, unambiguous Go types produced $H=0$ — but that's a property of the specific instrument (`qwen3-coder:30b`), not a floor guaranteed by the metric: a weaker or different model might not reach zero entropy even on a fully unambiguous spec.

The naming-noise contribution to $D_{pair}$ (0.6667 on a fixed structure) is **measured, not fixed**, and its implication for the gate threshold (see above) is not yet architecturally resolved — only recorded as a known open question.

---

## Ladder of claims: what changed in 25 days (and what didn't)

The first article closed by separating what's proven from what's hypothesis. Here's the same split for v0.1 — briefly, without repeating the argumentation from the sections above:

| Claim | Status |
| --- | --- |
| Metrics $K_{drift}$/$D_{const}$/$D_{pair}$ compute end-to-end, through the CLI | **implemented** |
| $K_{drift}$ runs in ~0.2ms on 1MB (14 allocs/op, independent of requirement count); a full `check` (with $D_{const}$) — 16.7ms, within the 100ms budget | **measured, test-pinned** |
| $D_{const}$ architecturally cannot produce a false block | **tested invariant** |
| The deterministic packages (`metrics`/`spec`/`config`/`calibrate`) don't touch the network | **tested invariant** (for exactly these 4 packages) |
| Naming alone can produce $D_{pair}=0.6667$ on a fixed structure | **measured once, pinned as a reference** |
| The threshold values (0.20/0.35/0.30) are correct for gating | **hypothesis from the first article, not calibrated** |
| $D_{pair}$ transfers across models/instruments | **not tested** — Ollama only |
| The measured dispersion predicts downstream outcomes (rework, compile failures, token budget) | **not tested** — no corpus |
| The "copy-floor" ($H=0$ on an unambiguous input) is a property of the metric | **refuted by the project's own documentation**: it's a property of the instrument, not a guarantee |

The data-accumulation loop just started: `label` and opt-in corpus accretion in `measure` are the project's newest commits (late July). Data for `calibrate` is the only medium-horizon item on the roadmap that doesn't need new architecture — just time and real measurements on live projects.

Code: [github.com/valpere/tumanomir](https://github.com/valpere/tumanomir).

---

### Data and reproducibility

Every output block in this article is a real run against the live binary (`make build && bin/tumanomir ...`), not a retelling of documentation, except for the explicitly marked exception in the naming-noise section. The specs used for `measure`/`gate` are the same `docs/investigation/_sanity/specs/sharp.md` as in the first article's sanity check. Tests reproduce via `make ci` at the repo root; benchmarks separately, via `go test ./internal/metrics/... -bench . -benchmem -run '^$'` (not part of `make ci`; ns/op is machine-dependent — allocations are stable).
