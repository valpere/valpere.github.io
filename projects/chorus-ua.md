---
layout: project
title: "chorus — крос-агентна plugin mesh"
permalink: /projects/chorus/
lang: uk
---

Більшість AI coding tools зроблені як острови.

Ви обираєте один — Claude Code, OpenCode, Gemini CLI, Codex, Cursor або Kilo — і залишаєтеся в його workflow. Хочете другу думку? Треба скопіювати контекст, перейти в інший термінал, заново пояснити задачу, зачекати, порівняти відповіді й вручну перенести корисне назад.

**chorus** прибирає цей крок.

## Що це таке

chorus — open-source колекція плагінів, яка створює **повну mesh делегування 6×6** між шістьма AI coding CLI:

| Від \ До | Claude | OpenCode | Gemini | Codex | Cursor | Kilo |
|----------|:------:|:--------:|:------:|:-----:|:------:|:----:|
| Claude Code | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| OpenCode | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Gemini CLI | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| Codex | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Cursor | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Kilo | ✅ | ✅ | ✅ | ✅ | ✅ | — |

Кожен агент може делегувати задачі п'ятьом іншим, не виходячи зі свого інтерфейсу.

## Інтеграція

**Claude Code** отримує slash commands:
```
/opencode:run refactor the auth module
/gemini:review check this diff for edge cases
/codex:run write tests for the new retry logic
/cursor:run check if this fits existing codebase patterns
/kilo:run review for naming clarity and maintainability
```

**OpenCode** отримує MCP tools:
```
delegate_claude("review this migration for data loss risk")
delegate_gemini("analyze this for performance bottlenecks")
delegate_codex("add integration tests")
delegate_cursor("check pattern consistency across the repo")
delegate_kilo("review for long-term readability")
```

**Gemini CLI**, **Codex**, **Cursor** і **Kilo** отримують skills/rules — встановіть раз, потім просто делегуйте природною мовою.

## Паралельне code review

Даєте п'ятьом різним агентам один diff незалежно, кожен із різним фокусом:

```text
/gemini:review   — correctness та edge cases
/codex:run       — test coverage та пропущені кейси
/cursor:run      — інтеграція з кодовою базою та узгодженість патернів
/kilo:run        — підтримуваність та якість найменування
/claude:review   — безпека та коректність
```

У різних моделей різні слабкі місця. Один пропустить edge case, який інший спіймає. chorus надає матеріал, рішення залишається за вами.

OpenCode бере участь у повній mesh 6×6, але виключений із паралельних workflow-патернів — його TUI stdout не можна перехопити програмно.

## Named workflow команди

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
gemini skills install https://github.com/valpere/chorus --path for-gemini/opencode
# ... та інші агенти
```

Повне встановлення для Codex, Cursor та Kilo — у [README](https://github.com/valpere/chorus).

chorus не намагається стати новою IDE або orchestration platform. Це plumbing між інструментами, якими розробники вже користуються. Одна інсталяція, шість агентів, жодних нових workflow.
