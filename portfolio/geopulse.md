---
layout: portfolio-item
title: "geopulse — GPS Fleet-Tracking Backend"
permalink: /portfolio/geopulse/
image: /portfolio/assets/images/geopulse/geopulse-en.png
---

## Overview

Independent demo project: a Go REST API for GPS fleet tracking — vehicles, circular geofences, position ingestion, and PostGIS-backed enter/exit event detection. Models the pattern behind fleet telematics integrations: a tracker (or a platform like Traccar relaying from one) pings positions, and the backend has to turn that raw stream into trustworthy "vehicle entered/left zone X" events.

**Result: exactly-once geofence events from a position stream that duplicates and reorders — the real failure mode of GPS trackers, not a hypothetical one — proven against direct database state, not just asserted.**

---

## The actual hard problem

Naively reacting to every ping — "are we inside geofence X right now? fire an event" — produces two real bugs: a retransmitted ping re-fires "enter" for a vehicle that's been parked inside a zone for an hour, and an out-of-order ping (delayed by a network retry) can make a vehicle that has since left a zone appear to re-enter it, because the stale ping's coordinates say so. Both are documented, real-world telematics failure modes — the second one is the same "false geofence trigger from delayed geodata" problem covered in the [ivr-elevenlabs](/portfolio/ivr-elevenlabs/) case study, from the other side of the same class of bug.

---

## Architecture

![geopulse position-to-event pipeline](/portfolio/assets/images/geopulse/geopulse-en.png)

Every ping runs through one transaction: advisory-lock the vehicle → insert-or-ignore the position → reject if out-of-order → `ST_DWithin` containment check per geofence → a pure decision function → commit whatever events resulted.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| `positions.UNIQUE(vehicle_id, recorded_at)` + `ON CONFLICT DO NOTHING` | Exact retransmits are absorbed at the database level — no duplicate row, no re-evaluation |
| Out-of-order check inside the same transaction as the insert | A ping older than the vehicle's current latest position is kept in history but never allowed to move geofence state backward |
| `pg_advisory_xact_lock(vehicle_id)` held for the *whole* ingest-and-evaluate transaction, not just the insert | Two concurrent pings for the same vehicle can't both read the same "current state" and both independently decide to fire a transition — pings for *different* vehicles still run fully in parallel, since the lock key is per-vehicle |
| `NextEventType` extracted as a pure function of "currently inside?" + "last event type?" | No I/O, fully unit tested — including a sequence test simulating a vehicle sitting on a geofence boundary through several pings, the exact scenario that causes enter/exit flapping without last-known-state tracking |
| Circular geofences (center + radius), not polygons | Covers the common real case — a depot, a delivery radius — with a simpler PostGIS query (`ST_DWithin`) than polygon containment, without sacrificing the actual hard part (the concurrency/ordering guarantees) |

---

## Results

- **Full REST API**: JWT auth, vehicle/geofence CRUD, a `X-Webhook-Secret`-gated position-ingestion endpoint (machine-to-machine, not a dispatcher action)
- **The enter/exit decision is pure and fully unit tested** — including a no-flapping sequence test — with no database required to run `go test ./...`
- **Verified end-to-end** via `docker compose up` (`postgis/postgis` image): migrations apply, a full enter → still-inside → exit sequence produces exactly 2 events (not one per ping), an exact-duplicate ping is absorbed with zero new events, an out-of-order ping is stored but inert
- **The concurrency guarantee confirmed against direct database state**: a burst of concurrent/rapid pings into an already-"inside" vehicle state produced zero spurious events — 5 total `geofence_events` rows across the whole test session (enter/exit/enter/exit/enter), exactly matching the vehicle's real in/out history despite far more than 5 position pings sent

Code: [github.com/valpere/geopulse](https://github.com/valpere/geopulse)

---

## Stack

`Go` · `chi` (router) · `pgx/v5` (no ORM) · `golang-jwt` · `bcrypt` · `PostgreSQL` + `PostGIS` (`geography`, `ST_DWithin`, `pg_advisory_xact_lock`) · `Docker Compose` · `testify`
