---
layout: portfolio-item
title: "opencart-catalog-migration — Large Store Migration to OpenCart 3/4 or Horoshop"
permalink: /portfolio/opencart-catalog-migration/
---

## Overview

A migration of a live, high-traffic online store from an outdated engine — **OpenCart 1.5 / 2.x**, **PrestaShop 1.6**, **VirtueMart** or a home-grown CMS — to a modern stack: **OpenCart 3.0.x / 4.x on PHP 8.2+** or the **Horoshop** SaaS platform. It is built for catalogs of 10,000+ SKU and keeps everything the store has accumulated: products, variants, order history and customers. The goal is a faster site and the end of the technology debt, with no loss of data or search rankings.

---

## Hard parts and how they are handled

| Hard part | How it is handled |
|---|---|
| A relational catalog: dozens of attributes, options (size, colour, pack size), manufacturers, multi-level categories | The ETL keeps every relation intact; attributes and options are normalized and variant structures mapped to the target data model, so nothing falls out of sync |
| Customers and order history | Password hashes carried over with salt and authentication compatibility, address books and the full transaction history kept for loyalty programs |
| Dirty content | Outdated HTML tags, inline styles, broken images and unsafe scripts stripped from product descriptions by automated rules and parsers |
| Speed at scale | MySQL queries and search indexes tuned, Redis or Memcached caching, Nginx FastCGI cache, all catalog images converted to WebP |
| Search rankings | Old SEO URLs (SEO PRO / alias) mapped to the new structure and turned into Nginx or Apache 301 rules |

---

## How it goes

![Migration flow: source CMS, ETL extractor, normalization, content cleanup, import, new CMS, speed, SEO](/assets/images/catalog-flow-en-1-1259x524.png)

1. **Extract and transform.** Direct MySQL reads of the `product`, `product_description`, `product_option`, `product_attribute`, `category`, `customer` and `order` tables, reshaped for the target model.
2. **Database and hosting.** PHP 8.1 / 8.2 with tuned OPcache, Nginx FastCGI cache and Redis for filter results, batch WebP conversion with the preview sizes the theme needs.
3. **Features.** A fast AJAX filter without a page reload, online payments (Monobank, LiqPay), automatic fiscal receipts (Checkbox PRRO / VchasnoKasa) and Nova Poshta with an interactive branch and parcel-locker map.
4. **SEO.** The old URL structure is mapped to the new one and the redirect rules are generated, so old links keep working.

Related: [fastshop](/portfolio/fastshop/) (a fast OpenCart storefront on 30,000 products), [fiscalgate](/portfolio/fiscalgate/), [feedsync](/portfolio/feedsync/).

---

## Stack

`OpenCart 3 / 4` · `Horoshop` · `PrestaShop` · `PHP 8.2+` · `Go (ETL)` · `MySQL 8` · `Redis` · `Nginx + PHP-FPM` · `Monobank API` · `LiqPay` · `Checkbox PRRO` · `Nova Poshta API` · `Screaming Frog`
