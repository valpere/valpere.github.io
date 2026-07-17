---
layout: post
title: "DataScrapexter: архітектура продакшн-фреймворку скрейпінгу на Go"
date: 2026-04-01
permalink: /blog/2026/04/01/datascrapexter-architecture/
category: deep-dive
tags: [go, scraping, architecture, colly]
lang: uk
description: "Огляд шаруватої Go-архітектури DataScrapexter — від керування запитами через обхід anti-детекції до мультиформатного виводу."
excerpt: "Більшість інструментів скрейпінгу — це або тонка обгортка над HTTP-клієнтом, або повноцінний харнес браузерної автоматизації. DataScrapexter свідомо стоїть між цими крайнощами, і архітектура відображає цей вибір."
image: /projects/assets/images/data_scrapexter/professional_web_scraping_solution-1-0768x0512.png
---

![DataScrapexter — professional web scraping solution](/projects/assets/images/data_scrapexter/professional_web_scraping_solution-1-0768x0512.png)

Більшість інструментів скрейпінгу — це або тонка обгортка над HTTP-клієнтом, або повноцінний харнес браузерної автоматизації. DataScrapexter свідомо стоїть між цими крайнощами, і архітектура відображає цей вибір.

## Чотирирівнева сервісна модель

DataScrapexter пропонується як багаторівневий сервіс, і рівні — це не просто ціноутворення, вони відповідають змістовно різним технічним конфігураціям:

- **Basic**: статичні HTML-сайти. Colly бере на себе fetch і парсинг; браузер не задіяний.
- **Standard**: сайти з легким JavaScript-рендерингом. Colly робить fetch; невеликий крок постобробки обробляє типові SPA-патерни на кшталт `<script type="application/json">` data island.
- **Professional**: потрібен повний JS-рендеринг. `chromedp` керує headless-інстансом Chromium; Colly не задіяний у шляху fetch.
- **Enterprise**: обхід anti-bot, ротація резидентних проксі, розв'язання капчі, кастомна логіка екстракції. Пайплайн — це Professional-рівень плюс шар middleware для обходу детекції.

Ця ярусність відображена в кодовій базі як фабричний патерн: `FetcherFactory` приймає структуру конфігурації й повертає інтерфейс `Fetcher`. Викликач ніколи не інстанціює Colly чи chromedp напряму.

## Пайплайн

![Configuration workflow diagram](/projects/assets/images/data_scrapexter/configuration_workflow_diagram-1-0768x0512.png)

Кожен запит проходить п'ять стадій незалежно від рівня:

```
Fetcher → Detector Bypass → Extractor → Normalizer → Formatter
```

**Fetcher** керує життєвим циклом HTTP — пулом з'єднань, логікою повторів, обмеженням швидкості й керуванням cookie jar. Для рівнів на базі Colly це обгортка над `colly.Collector` з додатковим middleware. Для рівнів на chromedp — обгортка над `chromedp.Context` з хуками життєвого циклу сторінки (очікування network idle, скрол для тригера lazy load тощо).

**Detector Bypass** — no-op на рівнях Basic/Standard. На Professional і Enterprise він інжектує реалістичні браузерні фінгерпринти: ротацію User-Agent, `Accept-Language`, нормалізацію TLS-фінгерпринту та джиттер таймінгу між запитами. Middleware — це ланцюжок кроків `func(req *Request) error`, тож окремі техніки обходу можна замінювати чи комбінувати, не торкаючись довколишнього коду.

**Extractor** бере сирий HTML (або DOM-знімок від chromedp) і застосовує CSS-селектори чи XPath-вирази, визначені у файлі конфігурації скрейпінгу (YAML або JSON). Схема конфігурації однакова для всіх рівнів. Extractor видає `map[string]interface{}` на кожну сутність, що скрейпиться.

**Normalizer** застосовує приведення типів, правила очищення (обрізання пробілів, видалення HTML-тегів, парсинг цін/дат) та перейменування полів. Правила нормалізації живуть у тому самому файлі конфігурації, що й селектори, під ключем `transforms`.

**Formatter** серіалізує у запитаний вивід: JSON, CSV або XLSX. Кожен формат має власну реалізацію `Formatter` за інтерфейсом `format.Formatter`. Додавання нового формату виводу — це одна структура з реалізацією двох методів.

## Модель конкурентності

DataScrapexter використовує патерн worker pool з конфігурованою паралельністю:

```go
pool := scraper.NewWorkerPool(cfg.Workers, fetcher, extractor)
pool.Submit(urls)
results := pool.Drain()
```

`Workers` за замовчуванням дорівнює 5 для Basic, 3 для Professional (інстанси chromedp важчі) і конфігурується користувачем до лімітів рівня. Пул керує каналом `semaphore` для обмеження кількості горутин і каналом `results`, який спустошує formatter. Помилки збираються окремо й репортуються після обробки всіх URL.

## Чому Colly і chromedp співіснують

Очевидне питання — чому не використовувати chromedp для всього. Дві причини:

1. **Продуктивність.** Fetch на базі Colly завершується за ~50мс на сторінку. Fetch через chromedp, з урахуванням амортизації запуску браузера, ближче до 500мс з прогрітим пулом. Для задачі скрейпінгу 10 000 товарних сторінок ця різниця становить приблизно 11 годин.

2. **Детектованість.** Headless-браузери мають добре відомі фінгерпринти. Запуск chromedp проти сайту, який не потребує JS-рендерингу, підвищує ризик детекції без жодної вигоди.

Фабричний патерн означає, що код виклику ідентичний незалежно від того, який fetcher активний. Перемикання сайту з Colly на chromedp — це зміна конфігурації в один рядок.

## Дизайн, керований конфігурацією

Уся логіка екстракції — в YAML, не в коді. Клієнт може змінювати селектори, додавати поля чи коригувати правила нормалізації без деплою. Це свідоме архітектурне рішення: фреймворк — це рантайм, що інтерпретує специфікації скрейпінгу, а не колекція сайт-специфічних скрейперів, запечених у бінарник.

```yaml
site: example-shop
base_url: https://example.com/products
pagination:
  selector: "a.next-page"
  max_pages: 50
fields:
  - name: title
    selector: "h1.product-title"
  - name: price
    selector: "span.price"
    transform: parse_price
  - name: sku
    selector: "[data-sku]"
    attribute: data-sku
output:
  format: csv
  path: ./output/products.csv
```

Такий підхід тримає ядро фреймворку стабільним, поки клієнт-специфічна логіка лишається у версіонованих конфігураційних файлах, а не в розгалуженому коді.

![Data output visualization](/projects/assets/images/data_scrapexter/data_output_visualization-1-0768x0512.png)
