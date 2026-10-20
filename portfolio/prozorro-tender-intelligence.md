---
layout: portfolio-item
title: "prozorro-tender-intelligence — Tender Monitoring and Analytics on the Prozorro Open API"
permalink: /portfolio/prozorro-tender-intelligence/
image: /portfolio/assets/images/prozorro-tender-intelligence/prozorro-flow-en-1-1376x768.jpg
---

## Overview

Monitoring and analytics for suppliers who bid on public procurement. It reads Prozorro's open REST API directly, finds the tenders that fit the company by CPV code and by the text of the attached documents, analyzes who wins and at what discount, and sends a prioritized digest to the manager every morning. It replaces hours of manual category watching, where urgent tenders get missed because of an unusual title.

---

## Hard parts and how they are handled

| Hard part | How it is handled |
|---|---|
| Dozens of categories to watch by hand | Direct integration with the open Prozorro API: complete data and no scraping, so nothing to get blocked |
| A tender can hide under a wrong title or CPV code | Search by CPV and by the text of the tender documentation, including PDF and DOCX |
| Requirements written around one competitor | A scan of the documentation for such requirements, so a complaint can be prepared in time |
| What price wins | Average winner discount per procuring entity, disqualification history and a price forecast |

---

## How it works

![Tender intelligence flow: Prozorro data stream, CPV classification and document extraction, requirement scanner, scoring and competitor pricing history, BI dashboards and a morning mobile digest](/portfolio/assets/images/prozorro-tender-intelligence/prozorro-flow-en-1-1376x768.jpg)

1. **Ingestion.** The open API is read continuously into PostgreSQL.
2. **Analysis.** CPV classification, document extraction, a qualification score and a competitor pricing history.
3. **Delivery.** Dashboards in Metabase and a personalized digest at 08:00 in Telegram or by email, with the most profitable tenders first.

Related: [bid-triage](/portfolio/bid-triage/), [ragline](/portfolio/ragline/).

---

## Stack

`Go` · `Prozorro Open API` · `PostgreSQL` · `DuckDB` · `Metabase` · `Telegram / Email digest` · `Docker`
