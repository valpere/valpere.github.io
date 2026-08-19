---
layout: portfolio-item
title: "fix-review — Multi-Agent PR Review Pipeline"
permalink: /portfolio/fix-review/
image: /portfolio/assets/images/fix-review/fix-review-en.png
---

## Overview

An internal Claude Code skill that fans a pull request diff out to three independent review "opinions" in parallel, then has an arbiter verify each finding against the actual repository state before touching anything — running in production on this site's own PRs since June 2026.

The design problem isn't "can an LLM review a diff" — any single model can, with a false-positive rate that makes trusting it blindly a bad idea. The real problem is: **how many independent opinions justify acting automatically, and who checks the checker?**

**Result: 22 PRs reviewed over 2 months, 69 individual model/tool review rounds, 81 raw findings surfaced — and only 2 warranted an actual code change.**

---

## Architecture

![fix-review three-tier cascade architecture](/portfolio/assets/images/fix-review/fix-review-en.png)

Three tiers, tried in order, each a full fallback for the one before it:

1. **Ollama Cloud** (primary) — three models in parallel, different families for independent review
2. **5 external CLI agents** (`cursor-agent`, `agy`, `omp`, `codex`, `opencode`, `kilo`) — read-only invocations, tried in cascade order, first non-empty result wins
3. **Ollama local** — fully offline, last resort

Findings are deduped by file:line and vote-counted across the rounds that ran, then handed to a Claude arbiter that reads the actual files before ruling — vote count is a **confidence prior, not proof**.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Arbiter re-reads real files before ruling | Model consensus on a finding doesn't mean it's real — caught unanimous false positives (hallucinated "missing frontmatter" on files that had it) that all 3 models agreed on |
| External agents invoked read-only (`--mode plan`, `--sandbox read-only`, `--no-tools`) | The tier this replaced ran `agy --dangerously-skip-permissions` and `codex --dangerously-bypass-approvals-and-sandbox` — full write/bypass access for a reviewer that only needs to read |
| Auto-merge only on a fully clean run | "Clean" = no fixes reverted, no merge conflicts, build passes — anything short of that asks the user once instead of guessing |
| Live end-to-end testing before trusting a fix | Forcing a cloud model to an invalid name and running a real PR through the cascade caught two real bugs code review alone would have missed (below) |

**Two bugs a live test caught that static review didn't:** `timeout <bash-function>` silently fails because `timeout` execs its argument as an external binary — it can't invoke a shell function directly, so the external-agent dispatch needed a `bash -c` wrapper. And a newly-added adapter (`agy`) was registered in the dispatcher but missing from the `export -f` list — it would have failed silently the first time the fallback tier actually triggered, since nothing exercises tier 2 when tier 1 (the common case) succeeds.

---

## Results

- **22 PRs reviewed**, June 19 – August 18, 2026 — real production use, not a demo
- **69 individual review rounds** (model or CLI-tool calls) across those PRs
- **81 raw findings → 2 confirmed fixes** after arbiter verification — the gap is the point: unanimous model agreement still needs checking against ground truth
- **One real security regression fixed**: replaced a permission-bypass CLI tier with a read-only cascade, verified live end-to-end before merging
- Architecture evolved across 6 commits over 2 months — added a model-agnostic external-agent fallback tier, retired deprecated models ahead of a provider cutoff, fixed a silent dispatch gap

---

## Stack

`Claude Code Skill (bash + jq + yq)` · `Ollama Cloud/Local` · `5 external CLI review agents` · `GitHub CLI (gh)` · `JSONL telemetry`
