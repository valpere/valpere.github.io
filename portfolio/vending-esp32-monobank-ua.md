---
layout: portfolio-item
title: "vending-esp32-monobank — IoT-контролер безконтактної оплати кавового автомата через Monobank"
permalink: /portfolio/vending-esp32-monobank/
lang: uk
lang_alt: /portfolio/vending-esp32-monobank/
---

## Огляд

Автономний IoT-контролер безконтактної оплати для кавових автоматів **Rheavendors** без абонплат. Покупець сканує QR-код **Monobank** на автоматі, безсерверний шлюз **Cloudflare Workers** обробляє платіжний вебхук і передає команду через **MQTT** з TLS на мікроконтролер **ESP32**. Гальванічна розв'язка через оптопари HY-M158 забезпечує безпечну комутацію шини CoinParallel без ризику для материнської плати.

Гроші напряму зараховуються на ФОП під 1.3% банку.

---

## Як це працює

| Крок | Що відбувається |
|---|---|
| 1 | Покупець сканує динамічний QR-код Monobank на автоматі |
| 2 | Безсерверний Cloudflare Worker отримує й обробляє платіжний вебхук |
| 3 | Worker публікує команду через MQTT з TLS (брокер HiveMQ) |
| 4 | ESP32 приймає команду й через оптопари комутує монетну шину автомата |

---

## Стек

`ESP32` · `C++` · `Cloudflare Workers` · `Serverless` · `Monobank Acquiring` · `MQTT` · `HiveMQ` · `IoT` · `Rheavendors`
