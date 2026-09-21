---
layout: portfolio-item
title: "fastshop — Fast Mobile-First OpenCart Store"
permalink: /portfolio/fastshop/
image: /portfolio/assets/images/fastshop/hero-0900x0530.png
---

## Overview

Independent project: a fast, mobile-first online store on **OpenCart 3.0.5 / PHP 8.3**, built as an overlay on stock OpenCart — a lean storefront theme, faceted filtering with SEO URLs, a one-page checkout with a Nova Poshta city/branch picker, Redis caching, WebP images and DB indexes — running a **30,000-product** catalog and measured against stock OpenCart on the same data.

**Result: catalog pages answer in 10 ms instead of 34 ms and search in 5 ms instead of 267 ms; Lighthouse mobile scores 100 with a 19–28 KB page (stock: 272–336 KB, first paint 2.1–2.4 s → 0.6–0.8 s).**

---

## The actual hard problem

Stock OpenCart on a large catalog is heavy: a JS/CSS stack shipped on every page, no attribute filters, expensive search, one SEO query per link, sessions in the database, and a multi-step checkout. Making it fast is not one trick but a set of coordinated changes that must survive product edits — the filter index and the page cache have to follow the admin, or the shop shows stale prices.

---

## Architecture

![fastshop: catalog, facet index, Redis cache, lean theme, one-page checkout](/portfolio/assets/images/fastshop/hero-0900x0530.png)

Pages are rendered by controllers hooked in as OpenCart *events*, so no core file is edited for them. A denormalised facet index (one row per product and category, one per attribute value, covering indexes) serves listings and per-value counts; page data lives in Redis under a version key that admin edits bump. The theme is a single inlined stylesheet plus vanilla JS.

---

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Facet index with counts computed against the *other* groups | The usual faceting semantics, in ≈9–25 ms for a 3-filter page |
| One canonical SEO URL per filter state (`/smartfony/f/brand-nordix/price-5000-30000`) | Every state is a crawlable page; other orderings 301 to it |
| Filters update without reload; plain links underneath | Fast for users, still works as ordinary navigation |
| Admin events re-index a product and bump the cache version | Edits show up at once, with no manual cache flush |
| Order created through OpenCart's own model | It appears in the admin like any other order |
| Keywords for a page's links fetched in one query | Replaces one `seo_url` query per link |

---

## Results

Same machine, same 30,000-product data, stock OpenCart 3.0.5.1 vs this set-up:

| Measure | Stock | fastshop |
|---|---|---|
| Catalog page, server time | 34 ms | **10 ms** (21 ms with an empty cache) |
| Search | 267 ms | **5 ms** |
| Catalog throughput | 160 req/s | **506 req/s** |
| Three-condition filter | — | **9 ms** |
| Lighthouse mobile | 94–97 | **100** |
| Page weight | 272–336 KB | **19–28 KB** |

37 end-to-end checks verify pages, cart, checkout and the admin path — filter counts are compared with an independent SQL count from OpenCart's own tables.

---

## Growing it into your store

- **Your catalog:** import with the standard OpenCart tools, then one command builds the filter index.
- **Nova Poshta:** set `NP_API_KEY` for the live directory.
- **Payments:** orders use OpenCart's own order model, so a payment extension can take over the payment step.

**Source:** [github.com/valpere/fastshop](https://github.com/valpere/fastshop)

---

## Stack

`OpenCart 3` · `PHP 8.3` · `MySQL` · `Redis` · `WebP` · `Docker`
