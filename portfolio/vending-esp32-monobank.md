---
layout: portfolio-item
title: "vending-esp32-monobank — IoT Coffee Machine Monobank Acquiring Controller"
permalink: /portfolio/vending-esp32-monobank/
---

## Overview

Zero-monthly-fee IoT telemetry and payment bridge for commercial **Rheavendors** coffee machines. The customer scans a dynamic **Monobank** QR code on the machine, a **Cloudflare Worker** receives the payment webhook and dispatches a TLS-encrypted **MQTT** pulse to an **ESP32** microcontroller. Optocoupler isolation triggers the exact beverage dispense without touching the machine's internal logic voltage.

No subscription fees; payments settle directly to the sole proprietor's (FOP) account.

---

## How it works

| Step | What happens |
|---|---|
| 1 | The customer scans a dynamic Monobank QR code shown on the machine |
| 2 | A serverless Cloudflare Worker receives and handles the payment webhook |
| 3 | The Worker publishes a TLS-encrypted MQTT command (HiveMQ broker) |
| 4 | The ESP32 receives the command and switches the machine's coin line through optocouplers |

---

## Stack

`ESP32` · `C++` · `Cloudflare Workers` · `Serverless` · `Monobank Acquiring` · `MQTT` · `HiveMQ` · `IoT` · `Rheavendors`
