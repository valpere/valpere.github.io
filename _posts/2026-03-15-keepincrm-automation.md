---
layout: post
title: "Automating KeepinCRM: From Manual Order Tracking to Zero-Touch Fulfillment"
date: 2026-03-15
permalink: /blog/2026/03/15/keepincrm-automation/
category: case-study
tags: [go, crm, automation, nova-poshta, telegram]
lang: en
description: "How a Go daemon watches Nova Poshta parcel statuses, moves CRM deals automatically, generates fiscal receipts, and sends SMS notifications."
excerpt: "The client runs a small e-commerce operation — handmade goods, 50 to 80 orders on a busy day. Every morning started the same way: open Nova Poshta, check each tracking number, open KeepinCRM, move each deal to the matching stage. Forty-five minutes, every day, on a task a machine should own."
image: /projects/assets/images/keepincrm/keepincrm_en-1-0632x0424.png
---

![KeepinCRM automation](/projects/assets/images/keepincrm/keepincrm_en-1-0632x0424.png)

The client runs a small e-commerce operation — handmade goods, 50 to 80 orders on a busy day. Every morning started the same way: open Nova Poshta, check each tracking number, open KeepinCRM, move each deal to the matching stage. Forty-five minutes, every day, on a task a machine should own.

## The Problem

Manual order tracking at that volume is not just tedious — it is error-prone. Missed status changes meant delayed follow-ups. Parcels returned to sender because nobody noticed the "storage expires in 2 days" status until day three. Fiscal receipts were generated manually after confirmation of delivery, which sometimes meant forgetting entirely.

The client had KeepinCRM configured with deal stages that mapped directly to parcel lifecycle states: `Shipped`, `In Transit`, `Awaiting Pickup`, `Delivered`, `Return Initiated`, `Returned`. The mapping was clear. The problem was that someone had to perform it manually, twice a day.

## The Solution

A Go daemon running on a small VPS, polling Nova Poshta's tracking API every 30 minutes and driving a pipeline of three downstream actions.

### Stage 1: Nova Poshta Polling

Nova Poshta provides a JSON API for tracking. The daemon maintains a SQLite table of active tracking numbers with their last known status. On each poll cycle:

```go
statuses, err := np.GetTrackingStatuses(ctx, activeTTNs)
for _, s := range statuses {
    if s.StatusCode != cache.Get(s.TTN) {
        events <- TrackingEvent{TTN: s.TTN, OldStatus: cache.Get(s.TTN), NewStatus: s.StatusCode}
        cache.Set(s.TTN, s.StatusCode)
    }
}
```

Nova Poshta's status codes are numeric. The daemon maps them to KeepinCRM stage names via a config file — the client can adjust the mapping without a code change.

### Stage 2: KeepinCRM Pipeline

KeepinCRM has a REST API for deal management. When a tracking event arrives, the daemon finds the deal associated with that tracking number (stored at deal creation time as a custom field) and moves it to the target stage:

```go
dealID, err := crm.FindDealByTTN(ctx, event.TTN)
if err != nil { log.Error(...); continue }
err = crm.MoveDeal(ctx, dealID, stageMap[event.NewStatus])
```

If `FindDealByTTN` returns nothing — the deal was closed, archived, or the TTN was entered incorrectly — the event is logged and a Telegram message is sent to the client's ops chat. No silent failures.

### Stage 3: Fiscal Receipts via Checkbox

Ukraine requires fiscal receipts for retail sales. The client was using Checkbox, which has an API for programmatic receipt generation. When a deal moves to `Delivered`, the daemon fetches the deal's line items from KeepinCRM and fires a receipt creation request to Checkbox:

```go
if event.NewStatus == StatusDelivered {
    items, err := crm.GetDealLineItems(ctx, dealID)
    receiptID, err := checkbox.CreateReceipt(ctx, items, deal.CustomerPhone)
    crm.AddNote(ctx, dealID, "Fiscal receipt: "+receiptID)
}
```

The receipt ID is written back to KeepinCRM as a deal note. The client can pull it up immediately if a customer asks.

### Stage 4: TurboSMS Notification

The final step sends an SMS to the customer when the parcel status changes to `Awaiting Pickup` — the most time-sensitive notification, since Nova Poshta storage is limited to five business days.

TurboSMS has a straightforward HTTP API. The message template is configurable:

```
Your order #{order_id} is waiting at {branch_address}. 
Storage until {expiry_date}. Track: https://novaposhta.ua/tracking/#{ttn}
```

The branch address and storage expiry date come from the Nova Poshta tracking response.

## Results

After two weeks of running in parallel with manual tracking (to validate correctness), the client switched to fully automated operation:

- **Zero manual deal moves** since go-live. The daemon processes 150–200 tracking events per day.
- **Fiscal receipts generated automatically** for every delivered order. Previously, about 15% were missed or delayed.
- **Approximately 2 hours per day recovered** — the morning tracking session and an afternoon check-in that were both eliminated.
- **Two return-to-sender events caught early** in the first month that would have been missed under the manual process.

The daemon has been running for four months. The only operational intervention was a Nova Poshta API schema change that broke status code parsing for three hours — caught via Telegram alert, fixed with a config update, no data loss.
