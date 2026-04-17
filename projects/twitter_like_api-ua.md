---
layout: project
title: Twitter-like REST API
permalink: /projects/testwigr/
exclude: true
lang: uk
lang_alt: /projects/testwigr/
---


**Посилання:** [GitHub](https://github.com/valpere/testwigr)

## Короткий огляд

Повноцінний Twitter-подібний REST API, побудований на Groovy та Spring Boot з використанням MongoDB. Реалізує реєстрацію та аутентифікацію користувачів (JWT), CRUD-операції для твітів, лайки, коментарі та відносини підписки — повноцінний бекенд для соціальної платформи з документацією Swagger/OpenAPI.

**Стек:** Groovy · Spring Boot · MongoDB · JWT · REST API · Swagger · OpenAPI

## Детальний огляд

### Мета

TestWigr побудований як демонстрація архітектури масштабованого бекенду соціальних медіа на Groovy та Spring Boot. Він демонструє реальні патерни: аутентифікацію на основі JWT, управління відносинами та соціальну взаємодію.

### Можливості API

- **Аутентифікація:** JWT реєстрація/вхід через Spring Security
- **Користувачі:** управління профілем, підписка/відписка
- **Твіти:** створення, читання, оновлення, видалення
- **Соціальне:** лайки та коментарі до твітів
- **Стрічка:** агрегований фід твітів підписок
- **Документація:** Swagger/OpenAPI специфікація для всіх ендпоінтів

### Архітектура

- **Мова:** Groovy
- **Фреймворк:** Spring Boot з Spring Security, Spring Data MongoDB
- **База даних:** MongoDB
- **Аутентифікація:** JWT-токени через Spring Security
- **Тестування:** JUnit 5 та Spock Framework
- **Документація:** Swagger/OpenAPI

### Відкритий код

Повний код доступний на GitHub з інструкціями з налаштування та документацією API у README.

---

*#groovy #spring-boot #mongodb #rest-api #jwt #бекенд #соціальні-медіа #swagger #openapi*
