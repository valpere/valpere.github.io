---
layout: portfolio-item
title: "feedsync — Supplier Feeds to Marketplace Price Lists"
permalink: /portfolio/feedsync/
image: /portfolio/assets/images/feedsync/hero-0900x0530.png
---

## Overview

Independent project: a Go service that turns a supplier's price feed (YML/XML, CSV or JSON) into **Rozetka** and **Prom.ua** price lists and keeps an OpenCart-style product table in sync. Category mapping, currency conversion, markup rules (fixed, percentage, by price range or category, with rounding) and stock filtering are configuration, not code; every rejected offer is reported with the rule it broke.

**Result: 25,000 offers become both price lists in about 1.5 s using about 36 MB of memory, every published file passes an independent re-validation with 0 errors, and a repeat OpenCart sync changes nothing (≈25 ms).**

---

## The actual hard problem

Converting XML is easy. The hard part is that a marketplace rejects — or silently drops — a whole price list because of a few bad offers, and feeds are far too big to eyeball. So the pipeline is built around *never publishing an unchecked file*: the feed is streamed token by token, each offer is validated on its own, the finished file is re-read from disk and checked again with the same rule set, and only then does it replace the live one.

---

## Architecture

![feedsync pipeline: supplier feed, transform, validate, publish, OpenCart](/portfolio/assets/images/feedsync/hero-0900x0530.png)

One streaming pass reads the feed, applies the transform, and writes each target to a temp file. Each target file is then re-validated from disk and atomically renamed over the published one; a failed run leaves the previous file in place. The same pass yields the OpenCart update list, applied as batched `UPDATE … CASE` statements in one transaction — only rows whose values actually differ are touched.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Streaming `xml.Decoder`, one `DecodeElement` per offer | Memory does not grow with the feed: 4× the offers used ≈2.5× the peak memory (36 MB → 91 MB at 100,000 offers) |
| Post-validation re-reads the file and shares one rule set with pre-validation | The writer is not trusted to have written what it meant to; the published file is what gets checked |
| Atomic temp-file + rename publish | The marketplace never sees a half-written or failed file |
| Deterministic offer IDs (`[A-Za-z0-9]+` kept, otherwise prefix + SHA-1) | The same supplier SKU gets the same ID on every run |
| Money as integer kopecks | No float drift in markup and rounding |
| Out-of-stock items are zeroed in the CMS with their price left alone | Dropping them from the price list is not enough — the shop would keep selling what the supplier no longer has |

---

## Results

| Measure | Result |
|---|---|
| 25,000 offers (26 MB) → Rozetka + Prom.ua | ≈1.5 s, ≈36 MB peak memory |
| 100,000 offers (105 MB) | 6–7 s, ≈91 MB |
| Published files re-validated | 0 errors on both targets |
| Rejected for Rozetka | 259 offers, each with its rule (missing picture, non-HTTPS picture, missing vendor) in `report.json` |
| OpenCart sync, MySQL 8.4 | 19,119 rows in 39 batches, ≈0.7 s; repeat run: 0 updated, ≈25 ms |

Unit and integration tests run under `-race`.

---

## Connecting it to your shop

- **Supplier feed:** set `source.path` to the supplier's file or URL and pick `source.format`; a new format is one more reader.
- **Marketplaces:** each entry under `targets` writes one price list — point `out` at the directory your web server exposes.
- **CMS:** put the MySQL connection string in `opencart.dsn` and price/stock sync starts with the next run.
- **Schedule:** `feedsync convert -c config.yaml -every 30m`.

**Source:** [github.com/valpere/feedsync](https://github.com/valpere/feedsync)

---

## Stack

`Go` · `encoding/xml` streaming · `MySQL` · `SQLite` · `Docker`
