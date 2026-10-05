---
layout: portfolio-item
title: "site-security-cleanup — Malware Remediation and CMS Hardening"
permalink: /portfolio/site-security-cleanup/
---

## Overview

Full recovery of sites and online stores after a hack, a malware infection, hidden mobile redirects (to casino or pharma pages), spam injected into the database, or mass spam sent from the server. Built for **WordPress**, **OpenCart** and **Joomla**, with 100% data preservation. The aim is to isolate and cure the threat, lift the Google Safe Browsing ("red screen") and hosting-provider blocks, move the site to a safe stack (PHP 8.2+), and put layered protection in place so it does not come back.

---

## Threats and how they are handled

| Threat | How it is handled |
|---|---|
| Hidden, conditional redirects that fire only for mobile visitors or for traffic from Google or Bing, so the owner sees a normal site in the admin | Heuristic and signature scanning, plus a diff against clean CMS cores |
| Web shells and layered backdoors in upload folders (`/wp-content/uploads/`, `/image/catalog/`, `/images/`), obfuscated PHP such as `eval(base64_decode(...))` | Search for `eval`, `assert`, `gzinflate`, `str_rot13` and `create_function`; CMS core and third-party plugins replaced with originals verified by checksum |
| SEO spam and database injection: thousands of junk pages in the Google index via `wp_posts`, `oc_product_description` or modified templates | MySQL scanned for malicious JS, hidden iframes, unknown administrators and spam links, then sanitized |
| Blocks by the host or by search engines ("Deceptive site ahead") | A review request in Google Search Console with a report of the work done |

---

## How it goes

```
Infected server / blocked site
        │  isolation and a full snapshot
        ▼
Clean staging (security sandbox)
  ├─ 1. signature and heuristic audit (ClamAV, Maldet, YARA)
  ├─ 2. diff against clean CMS cores (checksums)
  ├─ 3. manual deobfuscation and database sanitization
  └─ 4. core, theme and module updates, PHP 8.2+
        │  layered protection
        ▼
Hardening and WAF
  ├─ no PHP execution in upload folders
  ├─ 2FA for the admin panel, new secret salts
  ├─ WAF (Cloudflare WAF / ModSecurity)
  └─ review and sanction removal in Google Search Console
```

1. **Isolation, backup, sandbox.** A full isolated archive of the infected site and the database dump, deployed to a closed test stand so visitors are not affected and the infection stops spreading.
2. **Deep scan and backdoor removal.** File-system scanning with server tools (`maldet`, `clamav`, custom regex rules), a replacement of the CMS core and plugins with verified originals, and an audit of active themes and custom modules for SQL injection, XSS and arbitrary file upload.
3. **Database and config cleanup.** MySQL checked for malicious JS inserts, hidden iframes, unknown administrators and spam links; `.htaccess`, `nginx.conf`, `wp-config.php` and `index.php` cleaned and protected.
4. **Hardening and WAF.** PHP, CGI and Python scripts blocked in media upload directories (`/uploads/`, `/cache/`, `/tmp/`); access closed to configuration files and backups (`.sql`, `.tar.gz`, `.env`, `.git`); all passwords (database, FTP, SSH, admin) and authentication keys rotated; Cloudflare WAF cutting off botnets, login brute-force and scans for known vulnerabilities.
5. **Review and monitoring.** A review request to Google Search Console with a report, and daily file-integrity monitoring.

Related: [zero-downtime-migration](/portfolio/zero-downtime-migration/).

---

## Stack

`WordPress` · `OpenCart 2.x / 3.x` · `Joomla 3 / 4 / 5` · `MODX` · `Laravel` · `PHP 8.1 / 8.2+` · `MySQL / MariaDB` · `Linux (Ubuntu / Debian)` · `Nginx` · `Apache` · `Linux Malware Detect` · `ClamAV` · `WP-CLI` · `ModSecurity` · `Cloudflare WAF` · `Fail2ban` · `Google Search Console`
