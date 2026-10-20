---
layout: portfolio-item
title: "google-maps-lead-extractor — B2B Lead Generation from Google Maps with Contact Enrichment"
permalink: /portfolio/google-maps-lead-extractor/
image: /portfolio/assets/images/google-maps-lead-extractor/leads-flow-en-1-1376x768.jpg
---

## Overview

Builds fresh B2B contact lists of local businesses in a chosen region or country — retail, clinics, car services — straight from Google Maps and directories. Every record is cleaned, deduplicated and enriched with contacts from the company's own website, then delivered into a live **Google Sheets** table with the columns the client's sales team already uses. It fits sales departments and call centres that need a ready base instead of a raw scrape.

---

## Hard parts and how they are handled

| Hard part | How it is handled |
|---|---|
| Local-language names are missed by a standard parser | A multi-language grid of search terms (the local language, English and Ukrainian) over the cities and municipalities of the region, so places signed only in local script are found too |
| Non-target organizations flood the result | Categories are filtered by Google's internal place `types`, cutting service centres, resorts, hotels and the like |
| Phone numbers come in every format | Normalization to the international E.164 standard |
| The same place shows up several times | Deduplication by `Place ID` and coordinates |
| Maps give no direct contacts | The company website is crawled for email addresses and links to Instagram, Facebook and LinkedIn |

---

## How it works

![Lead engine flow: search terms and regional map, sanitization and enrichment core, Place ID deduplication, E.164 formatting, website crawler, live Google Sheets table](/portfolio/assets/images/google-maps-lead-extractor/leads-flow-en-1-1376x768.jpg)

1. **Geo grid.** Search terms in several languages are run over the target cities.
2. **Sanitization.** Non-target categories out, phones to E.164, duplicates merged.
3. **Enrichment.** The website crawl adds email and social links.
4. **Delivery.** Rows are written to a protected Google Sheets table in the client's column structure.

A base of 1,000–5,000 leads is the working size of one run.

Related: [crmbridge](/portfolio/crmbridge/), [marketplace-harvester](/portfolio/marketplace-harvester/).

---

## Stack

`Go` · `Google Places API` · `Outscraper / Apify` · `Google Sheets API` · `E.164 phone normalization` · `Docker`
