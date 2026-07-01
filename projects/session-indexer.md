---
layout: project
title: session-indexer
permalink: /projects/session-indexer/
exclude: true
lang: en
lang_alt: /uk/projects/session-indexer/
---

# session-indexer — Per-Project Semantic Session Recall for Claude Code

**Links:**

- [GitHub](https://github.com/valpere/session-indexer)

Per-project semantic search over Claude Code session history. Indexes JSONL
transcripts into a local SQLite store; retrieves via bge-m3 embeddings
(Ollama) with FTS5 BM25 fallback. Automatically injects relevant past context
at session start — no centralized server, no shared state between projects.

---

## The Problem

Returning to a project after a week and needing to find "what did we decide
about X" across dozens of past Claude Code sessions is a real friction point.
A simple rolling log gives you "where I left off last time" — useful, but it
doesn't answer "what have we discussed about this topic, ever?"

**Why not a centralized memory tool?** Tools like mempalace and agentmemory
maintain a single shared store across every project and agent. That
architecture has one fatal flaw: **if the central store dies, everything
dies.** A corrupt index or a crashed MCP server takes down memory for all
your projects simultaneously, and recovery is non-trivial.

`session-indexer` is per-project and append-only — `.claude/sessions.db`
lives inside the project's own `.claude/` directory. The worst failure mode
is losing one project's DB, which is fully recoverable by re-running `mine`
on the available JSONL transcripts (idempotent by design). Every project is
isolated; nothing you do in one can break another.

---

## How It Works

Two Claude Code hooks wire the system in:

- **Stop hook** (`session-index.sh`) — mines the just-finished session's JSONL
  transcript into `.claude/sessions.db`, embedding each chunk via bge-m3 if
  Ollama is available.
- **SessionStart hook** (`session-recall.sh`) — derives a search query from
  the current git branch name and recent commit messages, searches the
  index, and injects the top matching chunks as session context —
  automatically, with no manual query needed.

Manual search is also available at any time:

```bash
session-indexer search "config validation approach" --db .claude/sessions.db
# or from inside Claude Code:
/recall config validation approach
```

### CLI

```bash
session-indexer mine   <jsonl-path> --db .claude/sessions.db
session-indexer search <query>      --db .claude/sessions.db [--limit N] [--json]
session-indexer embed               --db .claude/sessions.db
session-indexer stats               --db .claude/sessions.db
```

`mine` runs with a 50-second deadline (headroom under the 60s Stop-hook
budget) — storing is fast and unconditional, embedding respects the
deadline. Chunks past the deadline are stored but flagged for backfill via
`embed`, so nothing is ever silently dropped.

### Search quality

When Ollama + bge-m3 are available, search ranks by cosine similarity over
1024-dim multilingual embeddings (English + Ukrainian both score well).
When Ollama is unavailable or the store has zero embeddings, search falls
back to FTS5 BM25 keyword matching automatically — no configuration needed,
no hard dependency on any external service.

---

## Tech Stack

- **Go 1.26** — single static binary, no runtime dependencies
- **SQLite** (`modernc.org/sqlite`, pure Go, no cgo) — per-project storage
- **Ollama + bge-m3** — optional vector embeddings for semantic search
- **Cobra** — CLI framework
- **FTS5** — automatic keyword-search fallback

---

## Why This Matters

Most AI coding assistants either forget everything between sessions or bolt
on a centralized memory service that becomes a single point of failure
across your entire workflow. `session-indexer` takes the opposite approach:
boring, per-project, append-only SQLite — the same architectural instinct
that makes Git itself reliable. If it breaks, it breaks alone, and it heals
itself by re-mining the transcripts that are already sitting on disk.

Open source, MIT licensed, built to be forked and adapted.

🔗 <https://github.com/valpere/session-indexer>
