---
layout: portfolio-item
title: "slotwise — Appointment Booking Backend"
permalink: /portfolio/slotwise/
image: /portfolio/assets/images/slotwise/slotwise-en.png
---

## Overview

Independent demo project: a Go REST API for appointment booking — resources, offerings, a booking lifecycle, and Telegram reminders. Models a pattern that recurs across a wide range of businesses (clinics, tutoring, consulting, salons): resources get booked into time slots, and the one rule that must never break is that the same resource can't be double-booked.

**Result: the double-booking guarantee lives in a Postgres constraint, not application code — and that claim is proven with a live concurrency test, not just asserted.**

---

## The actual hard problem

The obvious approach — check for overlapping bookings, then insert if none found — has a race window. Two requests for the same resource and overlapping times can both pass the check before either has inserted, and both succeed. This is a real bug class in booking systems, not a theoretical one.

slotwise doesn't check-then-insert. The `bookings` table has a Postgres `EXCLUDE` constraint on `(resource_id, during)` using `btree_gist`, where `during` is a `tstzrange`. Postgres itself rejects the second insert if the ranges overlap — the guarantee lives in the same transaction as the write, so there's no window for a race to slip through.

---

## Architecture

![slotwise domain and double-booking guard](/portfolio/assets/images/slotwise/slotwise-en.png)

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| `EXCLUDE USING gist (resource_id WITH =, during WITH &&)` instead of an application-level overlap check | The database enforces it inside the same transaction as the insert — no check-then-insert race window under concurrent requests, which an app-level check always has |
| Postgres error `23P01` (`exclusion_violation`) translated into a typed `ErrSlotTaken` | The handler layer never has to know about Postgres error codes; the domain error is what propagates to a `409 Conflict` |
| Booking status transitions checked against a single legal-edges table | Same pattern as [fleet-crm](/portfolio/fleet-crm/)'s work-order state machine: `pending → confirmed → completed/cancelled/no_show`, illegal moves rejected with a typed error, not silently accepted |
| Reminder sending requires `StatusConfirmed` and "not already sent," checked *before* the notifier is called | Sending a reminder for an unconfirmed booking, or double-notifying a client, are real footguns — enforced in the service layer, and a failed notifier call never marks the reminder as sent |
| `Notifier` interface with a `LogNotifier` fallback | The API is fully runnable with zero external credentials — no Telegram bot token required to build, test, or demo it |

---

## Results

- **Full REST API**: JWT auth, resources/offerings/bookings, a checked booking lifecycle, Telegram reminders
- **Interface-based repositories and notifier throughout** — every service/handler test runs against in-memory fakes; `go test ./... -race` passes clean, no database required
- **The double-booking guarantee is proven, not just built**: two concurrent `POST /api/bookings` requests fired in parallel at the live server, for the same resource with overlapping time ranges — confirmed against the live binary to return exactly one `201` and one `409`, with exactly one row in the database
- **Verified end-to-end** via `docker compose up`: migrations apply (including `CREATE EXTENSION btree_gist`), seeded login, full CRUD, legal/illegal status transitions, reminder-eligibility rules (409 before confirm, 409 on double-send)

Code: [github.com/valpere/slotwise](https://github.com/valpere/slotwise)

---

## Stack

`Go` · `chi` (router) · `pgx/v5` (no ORM) · `golang-jwt` · `bcrypt` · `PostgreSQL` (`tstzrange` + `EXCLUDE USING gist`) · `Telegram Bot API` · `Docker Compose` · `testify`
