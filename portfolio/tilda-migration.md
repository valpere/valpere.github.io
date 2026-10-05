---
layout: portfolio-item
title: "tilda-migration — Turnkey Move from Tilda to Horoshop, Weblium, WooCommerce or Shopify"
permalink: /portfolio/tilda-migration/
---

## Overview

A turnkey move of a business site or online store off **Tilda** onto an independent platform — **Horoshop**, **Weblium**, **WordPress / WooCommerce** or **Shopify** — keeping the existing design and structure, connecting Ukrainian payments and delivery directly, and keeping search rankings and organic traffic intact. The new site is built and filled on a staging domain, and the main domain is switched over without a minute of downtime.

---

## Risks and how they are handled

| Risk | How it is handled |
|---|---|
| URLs change, so rankings and traffic drop | A 301 redirect map for every page, product and category; Title, Description, H1 and OpenGraph tags carried over; a correct `sitemap.xml` and `robots.txt`; Google Search Console and GA4 reconnected |
| Responsive layout does not survive the move | Block structure, Zero-blocks, font pairs and interactive elements rebuilt on the new platform and tuned for mobile |
| The business stops while the site is rebuilt | Everything is configured and filled on an isolated staging domain; the live domain is switched in a low-traffic window |
| Payments and delivery are not ready on day one | Monobank, LiqPay, WayForPay and NovaPay paid straight to the owner's sole-proprietor IBAN, plus Nova Poshta and Ukrposhta delivery calculation, all wired before launch |

---

## How it goes

![Migration flow: audit, staging build, integrations, SEO migration, DNS switch, indexing, new site](/assets/images/tilda-flow-en-1-1259x524.png)

1. **Audit and export.** The Tilda site is crawled with Screaming Frog to capture the full URL map, meta data, hierarchy and media. The product base (CSV/YML), categories, attributes, original-quality photos and contact forms are exported.
2. **Rebuild on the target platform.** For stores: catalog, product variants (colour, size), filters, search and a one-page checkout. For company sites and landing pages: pages assembled from responsive blocks, with typography, animations and feedback forms.
3. **Integrations.** Payment gateways with success-payment webhooks; Nova Poshta (waybill generation, branch and parcel-locker choice); instant order and lead notifications to an admin Telegram chat and to a CRM (KeyCRM, SalesDrive, KeepinCRM).
4. **SEO migration and release.** The 301 map goes live (`.htaccess`, Nginx or the platform), the sitemap and robots files are generated, and DNS is switched (Cloudflare or name servers) with the SSL certificate and corporate mail (MX records) preserved.

---

## What the client gets

- A site that looks and behaves like the original, on a platform that is not Tilda
- Search traffic protected by a redirect for every old URL
- Orders that arrive in Telegram and the CRM instantly, with payments settling directly to the owner's account
- A switchover the customers do not notice

Related: [fastshop](/portfolio/fastshop/), [fiscalgate](/portfolio/fiscalgate/), [crmbridge](/portfolio/crmbridge/).

---

## Stack

`Horoshop` · `Weblium` · `WordPress / WooCommerce` · `Shopify` · `Monobank API` · `LiqPay` · `WayForPay` · `NovaPay` · `Nova Poshta API` · `Screaming Frog` · `Google Search Console` · `GA4` · `301 redirects` · `Telegram` · `KeyCRM / SalesDrive`
