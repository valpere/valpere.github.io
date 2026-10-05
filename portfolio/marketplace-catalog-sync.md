---
layout: portfolio-item
title: "marketplace-catalog-sync — Catalog Bridge Between Prom.ua, Rozetka and Horoshop"
permalink: /portfolio/marketplace-catalog-sync/
---

## Overview

Automated export, normalization, mapping and import of large product catalogs between Ukraine's main marketplaces and storefronts — **Prom.ua**, **Rozetka Marketplace**, **Horoshop**, **OpenCart**, **Zakupka** and **Epicentr**. It replaces hundreds of hours of manual content work, prepares feeds that pass Rozetka's strict moderation, and keeps prices and stock in step on a schedule. It is built on the Go core of [feedsync](/portfolio/feedsync/).

---

## Hard parts and how they are handled

| Hard part | How it is handled |
|---|---|
| The category trees of Prom.ua, Rozetka and Horoshop differ radically | A correspondence matrix puts thousands of products into the right branch of each marketplace's tree, without per-item guesswork |
| Rozetka rejects feeds over forbidden words in names, wrong photo sizes, unrecognized parameters or missing required attributes | A pre-validator checks the catalog before it is published, so problems are fixed at the source instead of discovered in moderation |
| Variants and descriptions arrive in every shape | Colour, size, volume and combined variant groups are converted to the target model, and HTML descriptions are cleaned of outdated links and third-party contacts |
| Prices and stock go stale | Scheduled updates change prices, availability and stock with minimal load on the suppliers' servers |

---

## How it works

![Sync flow: sources, parsing, category mapping, pre-validator, feed generation, schedule, marketplaces](/assets/images/marketplace-flow-en-1-1259x524.png)

1. **Parsing and standardization.** A universal reader for non-standard supplier XML/YML feeds, Excel and Google Sheets tables and the Prom.ua API, pulling the full attribute set, barcodes (EAN/UPC), article numbers and photos.
2. **Mapping and cleanup.** Categories are matched to the Rozetka, Prom and Horoshop classifiers. Product names follow Rozetka's pattern — `[Type] [Brand] [Model] [Key specs] [Article]` — and photos are checked for resolution (anything under 500 px is flagged) and a white background.
3. **Target feeds and auto-update.** Optimized YML / Rozetka XML files are generated and refreshed every 30–60 minutes, with price, exchange-rate and markup changes applied.

Related: [feedsync](/portfolio/feedsync/), [crmbridge](/portfolio/crmbridge/), [opencart-catalog-migration](/portfolio/opencart-catalog-migration/).

---

## Stack

`Go` · `Node.js` · `Docker` · `Rozetka XML` · `YML` · `CSV / JSON` · `Rozetka Marketplace API` · `Prom.ua API` · `Horoshop` · `OpenCart` · `SalesDrive` · `MySQL` · `SQLite` · `Redis`
