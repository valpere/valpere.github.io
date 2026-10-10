---
layout: portfolio-item
title: "zero-downtime-migration — Server and Domain Migration Without Losing Traffic"
permalink: /portfolio/zero-downtime-migration/
image: /assets/images/servermove-flow-en-1-1259x524.png
---

## Overview

A seamless move of busy sites, online stores and company web services — **WordPress**, **OpenCart**, **Laravel** and custom systems — to a new server or VPS/VDS, or to a new primary domain (a rebrand, a switch to `.ua` or `.com.ua`). The engineering aim is **zero downtime**: the business keeps running, corporate mail keeps working, and search weight is kept without redirect loops.

---

## Risks and how they are handled

| Risk | How it is handled |
|---|---|
| DNS changes take hours to a day to propagate, so part of the audience cannot reach the site and orders are lost | The TTL is lowered to 300 s a day before release, a final delta sync is run, and only then are the A records switched |
| Serialized data breaks: WordPress options and meta fields store domains in serialized form, and a plain SQL `REPLACE` corrupts widgets, themes and plugin settings | Serialization-aware tools — `wp-cli search-replace`, or custom scripts for OpenCart and Laravel |
| Redirect loops (`ERR_TOO_MANY_REDIRECTS`) when the protocol, `www` and the domain all change together | One verified redirect configuration (`.htaccess` or Nginx) and a 301 map that keeps the old link structure |
| Mailboxes lose history or land in spam | Mail moved with its history; MX, SPF, DKIM and DMARC records re-checked and validated |

---

## How it goes

![Server move flow: production A, rsync and dump, staging B, domain replacement, hosts test, TTL, delta, DNS switch](/assets/images/servermove-flow-en-1-1259x524.png)

1. **Target environment and backups.** A full cold backup of the source (file system and MySQL dump). The new server is tuned: Ubuntu 22.04 / 24.04, Nginx, PHP 8.2+, MariaDB / MySQL 8, memory limits, timeouts and OPcache.
2. **Database and URL replacement.** The database moves with tools that respect serialization, and configuration files (`wp-config.php`, `config.php`, `.env`) get their paths corrected.
3. **Staging test without touching DNS.** The whole site — cart, forms, admin panel and integrations — is checked through a local `hosts` entry pointing at the new IP.
4. **Switch and final delta.** TTL lowered 24 hours ahead, the final delta (orders and files that appeared during testing) synced, the A records updated, the 301 map applied if the domain changed, and the mail records validated.

Related: [opencart-catalog-migration](/portfolio/opencart-catalog-migration/), [tilda-migration](/portfolio/tilda-migration/), [site-security-cleanup](/portfolio/site-security-cleanup/).

---

## Stack

`Linux (Ubuntu / Debian)` · `Nginx` · `Apache` · `OpenLiteSpeed` · `PHP 8.2+` · `MySQL 8 / MariaDB` · `Redis` · `Docker` · `rsync` · `WP-CLI` · `Search-Replace-DB` · `certbot (Let's Encrypt)` · `Cloudflare API` · `SPF / DKIM / DMARC`
