---
layout: portfolio-item
title: "marketplace-harvester — Catalog Harvester and Repricing Engine for Prom.ua, Rozetka and OLX"
permalink: /portfolio/marketplace-harvester/
image: /portfolio/assets/images/marketplace-harvester/harvester-flow-en-1-1376x768.jpg
---

## Overview

Collects product catalogs from marketplaces and competitor shops — Prom.ua, Rozetka, OLX and similar — normalizes them and hands them over in the format the store imports: YML, XML or CSV feeds for **OpenCart**, **Shopify**, **WooCommerce** or **Prom.ua**, or straight into **KeyCRM**. A repricing module compares prices every day and either warns in Telegram or adjusts the margin automatically. It replaces the manual copying of product cards (photos, descriptions, attributes) and the late price changes that follow it.

---

## Hard parts and how they are handled

| Hard part | How it is handled |
|---|---|
| Rendering whole HTML pages is slow and heavy | Public and mobile endpoints are used wherever a marketplace offers them; a headless browser (Playwright) only for pages that have no API |
| Product cards are deep: variants, attributes, stock, wholesale prices | The full category tree and every variant (colour, size) are extracted, with original photos in full quality |
| Every store imports a different feed format | One normalized model, with YML / XML / CSV generators for the target platform, so an import is a single click |
| Prices drift while nobody is watching | A scheduled comparison over 10,000+ articles, with a Telegram warning or an automatic margin correction |

---

## How it works

![Harvester flow: marketplaces, mobile APIs and headless browser, ETL core with deduplication and category mapping, repricing engine, YML/XML/CSV feeds to OpenCart, Shopify, WooCommerce and KeyCRM](/portfolio/assets/images/marketplace-harvester/harvester-flow-en-1-1376x768.jpg)

1. **Collection.** API-first readers for Prom.ua, Rozetka and OLX, a headless browser as the fallback, and a pool of sessions and proxies with rotation so a run does not stop at the first block.
2. **Cleanup.** Deduplication, category mapping to the target tree, attribute and variant normalization.
3. **Delivery.** Ready-to-import feeds, or a push into a CRM, on a schedule.
4. **Repricing.** Daily price comparison; a warning or an automatic margin change.

Related: [marketplace-catalog-sync](/portfolio/marketplace-catalog-sync/), [feedsync](/portfolio/feedsync/), [crmbridge](/portfolio/crmbridge/).

---

## Stack

`Go` · `Playwright` · `PostgreSQL` · `Redis` · `YML / XML / CSV generators` · `KeyCRM API` · `Docker`
