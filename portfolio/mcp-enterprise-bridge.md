---
layout: portfolio-item
title: "mcp-enterprise-bridge — MCP Gateway for AI Agents: Controlled Access to DB, CRM & APIs"
permalink: /portfolio/mcp-enterprise-bridge/
image: /portfolio/assets/images/mcp-enterprise-bridge/hero-0900x0530.png
---

## Overview

Giving AI agents raw database credentials or full-access CRM tokens is a security incident waiting to happen: a single ambiguous prompt or prompt injection can dump customer PII, overwrite production records or trigger uncontrolled API bursts. A custom **Model Context Protocol (MCP) Gateway** sits between your AI agents (Claude, Cursor, OpenCode, Cline, or custom bots) and your internal systems (PostgreSQL, KeyCRM, SalesDrive, Google Workspace, Notion, ERP) — exposing strictly typed tools with role-based access control (RBAC), read/write separation, parameter guardrails and immutable audit logging.

**Result: any MCP-compatible AI agent can query live business data and execute approved workflows safely, while your credentials stay sealed on the server and every tool call is validated and logged.**

---

## The Real Hard Part

Connecting an agent to an internal API is easy for a demo; making it safe for daily company use is the hard part. LLMs do not respect soft prompt rules like "never delete rows" or "only query this tenant's orders." Security has to live in deterministic server code: parameterized queries, per-role tool whitelists, PII masking on outputs, rate limits, and explicit confirmation gates before mutating actions.

---

## How It Works

1. **Standardized MCP transport.** The gateway exposes a unified MCP server (`stdio` for local dev agents or authenticated Streamable HTTP / SSE over TLS for remote teams and backend bots).
2. **RBAC & tool whitelisting.** Each agent or user token maps to an explicit permission policy (e.g., `analyst` gets read-only SQL/CRM views; `ops-agent` can create draft tickets; destructive deletes and exports remain disabled).
3. **Deterministic guardrails & schema validation.** Every incoming tool call is validated against strict JSON Schemas, SQL queries run through parameterized read-only replicas with row/timeout caps, and sensitive fields (passwords, tokens, card numbers) are masked before returning to the LLM context.
4. **Immutable audit trail.** Every call logs `(actor, tool, arguments_hash, latency_ms, status, rows_returned)` to PostgreSQL, giving security and engineering teams complete visibility into how agents touch company data.

---

## Key Decisions

| Decision | Why |
|---|---|
| Credentials live strictly inside the MCP server | Agents never see DB passwords, CRM API keys or OAuth refresh tokens — revoking or rotating access takes seconds in one place. |
| Read-only vs write tool separation with RBAC | Prevents prompt injection from escalating a reporting assistant into modifying orders, prices or user permissions. |
| Parameterized tools instead of raw SQL/HTTP | Eliminates SQL injection, full-table scans (`LIMIT` + statement timeouts enforced) and arbitrary SSRF calls. |
| Output PII redaction & audit logging | Keeps secrets and regulated fields out of third-party LLM logs while creating a full compliance trail of every agent action. |

---

## What You Get

- Custom production MCP server (Go or TypeScript) tailored to your databases, CRM, Google Sheets/Drive, Notion or internal REST APIs
- Role-based access policies (`read-only`, `draft-write`, `approval-required`), rate limits and PII redaction rules
- Docker deployment with TLS authentication and ready client configs for Claude Desktop/Code, Cursor, OpenCode or your own AI backend
- Audit log schema, test suite and handover documentation for adding new tools

---

## Boundaries

- An MCP server enforces tool-level permissions and schema safety, but does not replace network-level firewalls or underlying database backups.
- Target internal systems must expose an API, webhook or read-replica database connection.

---

## Stack

`Model Context Protocol (MCP)` · `Go` · `PostgreSQL` · `Redis` · `JSON Schema` · `RBAC / OAuth2` · `KeyCRM / SalesDrive / Google Workspace / Notion APIs` · `Docker`
