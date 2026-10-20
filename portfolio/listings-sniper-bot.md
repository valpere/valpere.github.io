---
layout: portfolio-item
title: "listings-sniper-bot — Real-Time Listings Sniper for Auto.ria, Dom.ria and OLX with Telegram Alerts"
permalink: /portfolio/listings-sniper-bot/
image: /portfolio/assets/images/listings-sniper-bot/sniper-flow-en-1-1376x768.jpg
---

## Overview

Watches classified boards for new listings and pushes the good ones to a closed Telegram group within seconds: photo, the seller's number, how far the price sits below the market and a link. On the used-car and rental markets the best offers are gone in minutes, so a person searching by hand always loses the race. The monitor is a single Go binary that needs no browser.

---

## Hard parts and how they are handled

| Hard part | How it is handled |
|---|---|
| A manual search is always late | A Go service polls the boards' internal endpoints every 2–4 seconds over light HTTP/2 requests, without a heavy browser |
| Resellers, realtors and spam accounts fill the feed | Filtering against a base of known numbers and accounts |
| Not every cheap listing is a good one | The price deviation from the market average for that model or district is calculated on the fly |
| The same listing is reposted | Duplicates are detected by a hash of the text and of the first photos |

---

## How it works

![Sniper flow: Auto.ria, Dom.ria and OLX through Redis Streams into the Go engine, then an instant Telegram message with photo, price below market and a call button](/portfolio/assets/images/listings-sniper-bot/sniper-flow-en-1-1376x768.jpg)

1. **Polling.** One source adapter per board, short interval, native binary in a Docker container.
2. **Stream and filter.** New listings go through Redis Streams; resellers, duplicates and weak deals are dropped.
3. **Alert.** A Telegram message to the closed group: photo, direct seller number, calculated gain and a link.

Related: [bid-triage](/portfolio/bid-triage/), [crmbridge](/portfolio/crmbridge/).

---

## Stack

`Go` · `Telegram Bot API` · `Redis Streams` · `HTTP/2` · `Docker`
