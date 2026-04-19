---
layout: post
title: "chorus: крос-агентна mesh для AI coding CLI"
date: 2026-04-17
category: release-notes
tags: [AI, chorus, claude-code, opencode, gemini, codex, cursor, kilo, open-source]
lang: uk
permalink: /blog/2026/04/17/chorus-cross-agent-plugin-mesh/
description: "chorus — open-source колекція плагінів для делегування між Claude Code, OpenCode, Gemini CLI, Codex, Cursor і Kilo."
excerpt: "Більшість AI coding tools зроблені як острови."
image: /assets/images/posts/chorus/infographic-900x530.png
---

![chorus — крос-агентна mesh для AI coding CLI](/assets/images/posts/chorus/infographic-900x530.png)

Більшість AI coding tools зроблені як острови.

Ви обираєте один — Claude Code, OpenCode, Gemini CLI, Codex, Cursor або Kilo — і залишаєтеся в його workflow. Хочете другу думку? Треба скопіювати контекст, перейти в інший термінал, заново пояснити задачу, зачекати, порівняти відповіді й вручну перенести корисне назад.

Я зробив **chorus**, щоб прибрати цей крок.

## Що це таке

chorus — open-source колекція плагінів, яка створює **повну mesh делегування 6×6** між шістьма AI coding CLI:

| Від \\ До | Claude | OpenCode | Gemini | Codex | Cursor | Kilo |
|-----------|:------:|:--------:|:------:|:-----:|:------:|:----:|
| Claude Code | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| OpenCode | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Gemini CLI | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| Codex | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Cursor | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Kilo | ✅ | ✅ | ✅ | ✅ | ✅ | — |

Кожен агент може делегувати задачі п'ятьом іншим, не виходячи зі свого інтерфейсу.

## Інтеграція

**Claude Code** отримує slash commands:
```text
/opencode:run refactor the auth module
/gemini:review check this diff for edge cases
/codex:run write tests for the new retry logic
/cursor:run check if this fits existing codebase patterns
/kilo:run review for naming clarity and maintainability
```

**OpenCode** отримує MCP tools:
```text
delegate_claude("review this migration for data loss risk")
delegate_gemini("analyze this for performance bottlenecks")
delegate_codex("add integration tests")
delegate_cursor("check pattern consistency across the repo")
delegate_kilo("review for long-term readability")
```

**Gemini CLI**, **Codex**, **Cursor** і **Kilo** отримують skills/rules — встановіть раз, потім просто делегуйте природною мовою.

## Workflow, який реально важливий

Паралельне code review. Даєте п'ятьом різним агентам один diff незалежно, кожен із різним фокусом:

```text
/gemini:review   — correctness та edge cases
/codex:run       — test coverage та пропущені кейси
/cursor:run      — інтеграція з кодовою базою та узгодженість патернів
/kilo:run        — підтримуваність та якість найменування
/claude:review   — безпека та коректність
```

У різних моделей різні слабкі місця. Один пропустить edge case, який інший спіймає. Один перебільшить архітектурні деталі, де інший помітить відсутній тест. Ви читаєте всі п'ять відповідей і приймаєте рішення. Агенти надають матеріал, judgment залишається за вами.

OpenCode бере участь у повній mesh 6×6, але виключений із паралельних workflow-патернів — його TUI stdout не можна перехопити програмно.

## Named workflow команди

Замість того, щоб щоразу вручну запускати п'ять окремих команд із різними промптами, chorus постачає named workflow patterns як перший клас installable plugins:

| Команда | Що робить |
|---|---|
| `/chorus:review` | Паралельне review `git diff HEAD` — одна команда, 5 незалежних думок |
| `/chorus:council` | Одне завдання п'ятьом агентам із різними ролями; host синтезує |
| `/chorus:debug` | Ранжовані гіпотези першопричини від 5 агентів для симптому баґу |
| `/chorus:second-opinion` | Швидка незалежна перевірка одним обраним агентом |

OpenCode отримує їх як MCP tools: `council`, `parallel_review`, `parallel_debug`, `second_opinion`. Gemini CLI, Codex, Cursor та Kilo — як skills/rules.

## Встановлення

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode

# Gemini CLI
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
# ... та інші агенти
```

Повне встановлення для Codex, Cursor та Kilo — у [README](https://github.com/valpere/chorus).

chorus не намагається стати новою IDE або orchestration platform. Це plumbing між інструментами, якими розробники вже користуються. Одна інсталяція, шість агентів, жодних нових workflow.

**[https://github.com/valpere/chorus](https://github.com/valpere/chorus)**
