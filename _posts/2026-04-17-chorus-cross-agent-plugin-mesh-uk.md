---
layout: post
title: "chorus: крос-агентна mesh для AI coding CLI"
date: 2026-04-17
category: release-notes
tags: [AI, chorus, claude-code, opencode, gemini, codex, open-source]
lang: uk
permalink: /blog/2026/04/17/chorus-cross-agent-plugin-mesh/
description: "chorus — open-source колекція плагінів, яка створює mesh делегування 4×3 між Claude Code, OpenCode, Gemini CLI та Codex, не виходячи з поточного інтерфейсу."
image: /assets/images/posts/chorus/infographic-900x530.png
---

![chorus — крос-агентна mesh для AI coding CLI](/assets/images/posts/chorus/infographic-900x530.png)

Більшість AI coding tools зроблені як острови.

Ви обираєте один — Claude Code, OpenCode, Gemini CLI або Codex — і залишаєтеся в його workflow. Хочете другу думку? Треба скопіювати контекст, перейти в інший термінал, заново пояснити задачу, зачекати, порівняти відповіді й вручну перенести корисне назад.

Я зробив **chorus**, щоб прибрати цей крок.

## Що це таке

chorus — open-source колекція плагінів, яка створює **mesh делегування 4×3** між чотирма AI coding CLI:

| Від \ До    | Claude | OpenCode | Gemini | Codex |
|-------------|--------|----------|--------|-------|
| Claude Code |   —    |  ✅      |  ✅    |  ✅   |
| OpenCode    |  ✅    |  —       |  ✅    |  ✅   |
| Gemini CLI  |  ✅    |  ✅      |  —     |  ✅   |
| Codex       |  ✅    |  ✅      |  ✅    |  —    |

Кожен агент може делегувати задачі трьом іншим, не виходячи зі свого інтерфейсу.

## Інтеграція

**Claude Code** отримує slash commands:
```
/opencode:run refactor the auth module
/gemini:review check this diff for edge cases
/codex:run write tests for the new retry logic
```

**OpenCode** отримує MCP tools:
```
delegate_claude("review this migration for data loss risk")
delegate_gemini("analyze this for performance bottlenecks")
delegate_codex("add integration tests")
```

**Gemini CLI** і **Codex** отримують skills — встановіть раз, потім просто скажіть агенту делегувати природною мовою.

## Workflow, який реально важливий

Паралельне code review. Даєте трьом різним агентам один diff незалежно, кожен із різним фокусом:

```text
/gemini:review — correctness та edge cases
/codex:run    — test coverage
/opencode:run — архітектура та спрощення
```

У різних моделей різні слабкі місця. Один пропустить edge case, який інший спіймає. Один перебільшить архітектурні деталі, де інший помітить відсутній тест. Ви читаєте всі три відповіді й приймаєте рішення. Агенти надають матеріал, judgment залишається за вами.

## Встановлення

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode
```

Повне встановлення для Gemini CLI та Codex — у README.

chorus не намагається стати новою IDE або orchestration platform. Це plumbing між інструментами, якими розробники вже користуються. Одна інсталяція, чотири агенти, жодних нових workflow.

**[https://github.com/valpere/chorus](https://github.com/valpere/chorus)**
