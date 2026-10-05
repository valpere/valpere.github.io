---
layout: portfolio-item
title: "vending-esp32-monobank — Monobank QR Payments for a Coffee Machine, Built on ESP32"
permalink: /portfolio/vending-esp32-monobank/
---

## Overview

A payment controller that lets a commercial **Rheavendors** coffee machine take **Monobank** QR payments directly — no payment intermediary and no monthly fee. The customer scans a QR code and pays in Monobank (or with Apple Pay / Google Pay); the money lands on the owner's sole-proprietor (FOP) account at the bank's 1.3% rate. A **Cloudflare Worker** verifies the payment with Monobank and queues a command, and an **ESP32** on the machine picks it up and credits the machine through an optocoupler-isolated board wired to its coin-input connector. The customer then presses the drink button as usual.

It replaces third-party payment terminals, which typically charge a per-machine subscription (around 150–250 UAH a month) plus 2.5–3.5% per transaction.

**Verified end to end on the customer's machine** with real Monobank payments: a paid QR scan credits the machine and a drink is poured, and every one of the four price channels credits its amount.

---

## How it works

| Step | What happens |
|---|---|
| 1 | The customer scans a printed QR sticker; each sticker maps to a price channel, and the price is fixed on the server |
| 2 | Monobank takes the payment and calls the Cloudflare Worker's webhook |
| 3 | The Worker does not trust the webhook body: it re-fetches the invoice from the Monobank API and checks status, reference and that the amount equals the channel price. A repeated webhook for the same invoice is ignored |
| 4 | The command is queued in a per-machine Durable Object — first in, first out, expiring after 15 minutes — and stays there until it is acknowledged |
| 5 | The ESP32, on a 4G USB Wi-Fi router, polls over HTTPS every 3 seconds and checks the machine's Ready input |
| 6 | It sends a 500 ms pulse through an HY-M158 (PC817) optocoupler channel to the machine's J4 coin connector, and the credit appears |
| 7 | The ESP32 acknowledges and the command leaves the queue. The last transaction ID is kept in non-volatile memory, so a retry can never pay out twice |

---

## Architecture

```
  Customer's phone ──▶ Monobank Pay ──▶ webhook
                                           │  verified against the Monobank API
                                           ▼
                   Cloudflare Worker + Durable Object (one per machine)
                   queue · dedup · telemetry · phone dashboard
                                           │  HTTPS poll every 3 s / ack
                                           ▼
       4G USB Wi-Fi router ──▶ ESP32 ──▶ Ready input · transaction ID in NVS
                                           │  500 ms pulse
                                           ▼
        HY-M158 optocoupler board (5000 V isolation) ──▶ J4 coin connector ──▶ machine credit
```

Hardware per machine is an ESP32 DevKit, a 4G USB Wi-Fi router, an 8-channel HY-M158 board and a dedicated 5 V power supply — about 750–800 UAH in total.

---

## Key Design Decisions

| Decision | Why |
|---|---|
| HTTP polling and a Durable Object instead of an MQTT broker | The first plan was MQTT through a hosted broker. On Cloudflare's free plan, a queue in Workers KV breaks down: KV allows 1,000 writes or lists a day (a poll-per-second queue would exhaust that in about 17 minutes) and caches missing keys for up to 60 seconds, so a paid command could stay invisible. A Durable Object is single-threaded and immediately consistent. The request budget is worked out per machine — about 30,000 a day at a 3-second poll, enough for three machines on the free plan, with the knobs to scale documented |
| Never trust the webhook | The bank is asked about the invoice every time. Prices are fixed on the server, and a `?price=` parameter on the pay link is ignored |
| An acknowledged queue: nothing lost, nothing paid twice | A command is deleted only after the ESP32 acknowledges the pulse. Two payments arrive in order, none overwrites another, and an unacknowledged command expires instead of firing late |
| Galvanic isolation and a separate power supply | 5000 V isolation between the machine's 12/24 V board and the ESP32's 3.3 V logic. The ESP32 and the modem run from their own 5 V supply, never from the machine's board: the modem's current spikes (up to 1.5–2 A) would overload a regulator rated for 300–400 mA |
| Respect the machine's own state | A pulse is sent only when the machine is ready to accept credit. Measured on the real machine, Ready turned out to be inverted (12 V means not ready) and to mean "credit acceptance allowed", not "brewing" — so it also blocks at the machine's maximum credit. A command simply waits in the queue: in a test one was held for minutes and credited once the machine was ready, with no repeat |
| Payment is credit, not a dispense | The machine takes credit and the customer then picks a drink, so the stickers carry amounts rather than drink names — one QR per price instead of one per recipe |
| Commissioned through the owner's photos and multimeter readings | The J4 connector's pin map was worked out remotely: board photos, a safe-probing procedure, and polarity checks, one contact at a time |

---

## What was delivered

- The **Worker** and the **ESP32 firmware**, with 18 automated tests covering forged webhooks, mismatched amounts, retries, ordering, the admin guard and expiry.
- A **phone dashboard** with live telemetry; a machine counts as offline after 120 seconds of silence.
- A **browser-based flasher**, served by the Worker, so the owner programs the ESP32 without installing anything.
- A generator for **printable QR sticker sheets** (A4), with the price read from the Worker.
- A **customer guide** (PDF, docx and ODT) covering setup, changing prices and adding another machine.
- A **CLI toolkit**: diagnostics, a payment simulator that charges nothing, a test dispense, a terminal ESP32 emulator, deploy and release packaging.

About 1,750 lines of JavaScript and C++, 42 commits, from the first commit on 25 September 2026.

---

## Stack

`ESP32` · `C++ (Arduino)` · `Cloudflare Workers` · `Durable Objects (SQLite)` · `Monobank Acquiring API` · `HY-M158 / PC817` · `Node.js` · `Wrangler` · `IoT` · `Rheavendors`
