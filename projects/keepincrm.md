---
layout: project
title: KeepinCRM Automation for E-Commerce
permalink: /projects/keepincrm/
exclude: true
lang: en
lang_alt: /uk/projects/keepincrm/
---

# KeepinCRM Automation for E-Commerce

[Те саме Українською](../keepincrm-ua/)

**Links:**

- [FreelanceHunt](https://freelancehunt.com/freelancer/valpere.html#portfolio)

A Go daemon that fully automates the CRM workflow of a Ukrainian e-commerce store integrated with Nova Poshta, Checkbox (ПРРО), and TurboSMS.

![KeepinCRM Automation for E-Commerce](/projects/assets/images/keepincrm/keepincrm_en-1-1264x0848.png)

---

## Overview

The client operated an online store on Prom.ua receiving dozens of orders per day. Orders flowed into KeepinCRM automatically, but everything else — moving deals through the funnel, issuing fiscal receipts, notifying customers — required manual work and was error-prone.

The goal: zero manual intervention from order placement to fiscal receipt delivery.

---

## What Was Built

A lightweight Go daemon (`keepincrm-auto`) that polls KeepinCRM every 5 minutes and orchestrates three integrations in a single cycle:

### 1. Sales Funnel Automation (Nova Poshta → KeepinCRM)

Nova Poshta delivery statuses are mapped to CRM stages automatically:

| NP Status | CRM Stage |
|---|---|
| Shipped (4/5/6) | Відправлено |
| Arrived at branch (7/101) | Очікує отримання |
| Received + paid (9) | Отримано — очікуємо післяплату |
| Funds transferred (10/11) | Завершено |
| Cancelled (102–106) | Скасовано |

Each transition is recorded as a CRM comment and deduplicated via SQLite — no double moves, no matter how many times the same status is polled.

### 2. Fiscal Receipt Generation (Checkbox ПРРО)

Receipts are issued with the correct Ukrainian payment type for each payment method:

| Payment | Trigger | Checkbox type |
|---|---|---|
| COD / NovaPay | NP status 9 (parcel received) | `CASHLESS` · "Платіж через інтегратора NovaPay" |
| WayForPay | Immediately on order arrival in CRM | `CASHLESS` · "Платіж через інтегратора WayForPay" |
| Cash / bank transfer | — | Handled manually |

**Key insight for WayForPay:** the existing architecture only tracked deliveries (TTN-based). WayForPay orders are paid online before a TTN exists, so they were invisible to the service. The solution: a parallel scan of all CRM agreements using `GET /agreements`, filtering by `prom_payment_type`, and fiscalizing immediately — no TTN required. Dedup key: `agreement:<id>`.

After each receipt, the daemon polls Checkbox until DPS assigns a `fiscal_code` (async, up to 60 s), then posts the receipt link as a CRM comment.

### 3. SMS Notifications (TurboSMS)

- **SMS #1** — on TTN creation: tracking number + Nova Poshta link
- **SMS #2** — on arrival at branch: pickup reminder
- **SMS #3** — after fiscalization: link to the public fiscal receipt

All SMS events are deduplicated; cancelled TTNs are skipped; phone numbers normalized to `+380` format.

---

## Architecture

```
Prom.ua ──────────────────► KeepinCRM
Nova Poshta API ──────────►       │
                                  │ GET /deliveries
                                  │ GET /agreements
                                  ▼
                    ┌─────────────────────────┐
                    │   keepincrm-auto        │
                    │   Go daemon · systemd   │
                    │                         │
                    │  Delivery Processor     │
                    │  Agreement Scanner WFP  │
                    │  SQLite dedup           │
                    └──────┬──────────┬───────┘
                           │          │
                    Checkbox ПРРО   TurboSMS
                           │          │
                           └────┬─────┘
                                ▼
                             Клієнт
                     (fiscal receipt link + SMS)
```

---

## Technical Highlights

- **Language:** Go 1.24+
- **State:** SQLite with `UNIQUE (ttn, event_type)` constraint — idempotent by design
- **DPS async polling:** after `POST /receipts/sell`, polls `GET /receipts/{id}` up to 12 × 5 s until `fiscal_code` is populated
- **Checkbox payment type:** `CASHLESS` + `label` (confirmed against real Prom.ua mono receipt — same pattern)
- **Deployment:** systemd unit on client's existing VPS (Ubuntu 20.04, CyberPanel); deploy script via `rsync` + remote `go build`
- **Observability:** structured logging (`log/slog`), daily SQLite backup cron, watchdog cron that auto-restarts if service is down

---

## Results

- **14 backlogged WayForPay receipts** issued in the first cycle after deployment
- **97% SMS delivery rate** (72 sent, 2 unreachable numbers)
- Every new order processed within 5 minutes, fully automatically
- Zero duplicate receipts or duplicate SMS confirmed after weeks in production

\#golang #systemd #sqlite #rest_api #keepincrm #nova_poshta #checkbox #turbosms #wayforpay #e_commerce #crm_automation #fiscalization #prro
