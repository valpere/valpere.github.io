---
layout: portfolio-item
title: "fleet-crm — Fleet/Logistics CRM Backend"
permalink: /portfolio/fleet-crm/
image: /portfolio/assets/images/fleet-crm/fleet-crm-en.png
---

## Overview

Independent demo project: a Go REST API for a fleet-dispatch CRM — clients, vehicles, drivers, a work-order lifecycle, invoicing, and a telematics webhook for ingesting live GPS/odometer pings from external hardware.

Built to demonstrate a pattern that keeps recurring in freelance requests — a dispatch company needing a CRM that ties clients, fleet, and billing together, fed by an external telematics/GPS provider — with the same engineering discipline as client-delivered work: interface-based repositories, a state machine instead of a free-form status column, and every claim below verified against a live binary, not just unit tests.

**Result: full CRUD + auth + a checked work-order state machine + a webhook, with one real cross-entity bug found and fixed before the first commit.**

---

## Architecture

![fleet-crm domain relationships](/portfolio/assets/images/fleet-crm/fleet-crm-en.png)

A `WorkOrder` ties `Client` + `Vehicle` (+ optional `Driver`) together and drives two things: an `Invoice`, only once completed, and the vehicle's own status — set through a dedicated partial update, not a full-row replace (see below for why that distinction matters). A telematics webhook is the only unauthenticated write path into the API — gated by a shared secret, not a JWT, since it's machine-to-machine.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Work-order transitions checked against a single legal-edges table | `scheduled → in_progress/cancelled`, `in_progress → completed/cancelled`, both terminal states closed. A naive status column would let a request skip straight to `completed` or "un-complete" a finished job — illegal moves return `409` with a typed `ErrIllegalTransition`. |
| Vehicle status changed via `UpdateStatus` (partial), never `Update` (full-row) | Every `Repository` is an interface `Service`/`Handler` code depends on — swappable for an in-memory fake in tests, no database needed to run `go test ./...`. |
| Invoice creation checks the work order is `StatusCompleted` first | Billing before the job is actually done is a real-world bug class, not a hypothetical — enforced in the service layer, not left to the client to get right. |
| Telematics webhook uses `crypto/subtle.ConstantTimeCompare`, not `==` | A plain string comparison on a secret header leaks timing information proportional to the matching prefix length — small detail, but the kind that separates "read a tutorial" from "actually thought about it." |
| No migration framework for 6 tables | Hand-rolled embedded-SQL runner (`internal/db`) — an `applied_migrations` table plus sorted `embed.FS` execution. Simpler than pulling in a dependency for a schema this size. |

**The bug that mattered:** an early version of the work-order → vehicle side effect called the general `vehicle.Update(id, vehicle.Vehicle{Status: newStatus})` — passing a struct with only `Status` set. Since `Update` replaces the whole row, every single work-order status change would have silently zeroed the vehicle's plate number, type, and odometer reading. Caught by a regression test asserting those fields survive a transition, and confirmed again in a live `docker compose` run before the first commit — not just trusted because the test passed.

---

## Results

- **Full REST API**: JWT auth (bcrypt + 8h tokens, no public registration), CRUD for clients/vehicles/drivers, work-order lifecycle, invoicing, telematics webhook
- **One real cross-entity bug found and fixed** pre-commit — the `Update`-vs-`UpdateStatus` data-loss bug above
- **Interface-based repositories throughout** — every service/handler test runs against in-memory fakes; `go test ./... -race` passes clean, no database required
- **Verified end-to-end**, not just unit-tested: `docker compose up` → migrations apply on boot → seeded admin login → full CRUD → illegal transition rejected (`409`) → legal transition confirmed, including that untouched vehicle fields survive it → invoice-before-completion rejected (`409`) → invoice succeeds post-completion → both webhook paths (wrong secret rejected, correct secret updates the vehicle) confirmed against the live binary

Code: [github.com/valpere/fleet-crm](https://github.com/valpere/fleet-crm)

---

## Stack

`Go` · `chi` (router) · `pgx/v5` (no ORM) · `golang-jwt` · `bcrypt` · `PostgreSQL` · `Docker Compose` · `testify`
