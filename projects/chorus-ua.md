---
layout: project
title: "chorus — крос-агентна plugin mesh"
permalink: /projects/chorus/
hero_image: /assets/images/posts/chorus/infographic-900x530.png
tech: ["Claude Code", "OpenCode", "Gemini CLI", "Codex", "MCP", "Plugin"]
links:
  github: "https://github.com/valpere/chorus"
lang: uk
---

![chorus — крос-агентна plugin mesh](/assets/images/posts/chorus/infographic-900x530.png)

Більшість AI coding tools зроблені як острови.

Ви обираєте один — Claude Code, OpenCode, Gemini CLI або Codex — і залишаєтеся в його workflow. Хочете другу думку? Треба скопіювати контекст, перейти в інший термінал, заново пояснити задачу, зачекати, порівняти відповіді й вручну перенести корисне назад.

**chorus** прибирає цей крок.

## Що це таке

chorus — open-source колекція плагінів, яка створює **mesh делегування 4×3** між чотирма AI coding CLI:

| Від \ До | Claude | OpenCode | Gemini | Codex |
|----------|--------|----------|--------|-------|
| Claude Code | — | ✅ | ✅ | ✅ |
| OpenCode | ✅ | — | ✅ | ✅ |
| Gemini CLI | ✅ | ✅ | — | ✅ |
| Codex | ✅ | ✅ | ✅ | — |

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

## Паралельне code review

Даєте трьом різним агентам один diff незалежно, кожен із різним фокусом:

```text
/gemini:review — correctness та edge cases
/codex:run    — test coverage
/opencode:run — архітектура та спрощення
```

У різних моделей різні слабкі місця. Один пропустить edge case, який інший спіймає. chorus надає матеріал, рішення залишається за вами.

## Named workflow команди

| Команда | Що робить |
|---|---|
| `/chorus:review` | Паралельне review `git diff HEAD` — одна команда, 3 незалежні думки |
| `/chorus:council` | Одне завдання трьом агентам із різними ролями; host синтезує |
| `/chorus:debug` | Ранжовані гіпотези першопричини від 3 агентів для симптому баґу |
| `/chorus:second-opinion` | Швидка незалежна перевірка одним обраним агентом |

OpenCode отримує їх як MCP tools: `council`, `parallel_review`, `parallel_debug`, `second_opinion`. Gemini CLI та Codex — як skills.

## Встановлення

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode
```

Повне встановлення для Gemini CLI та Codex — у [README](https://github.com/valpere/chorus).

chorus не намагається стати новою IDE або orchestration platform. Це plumbing між інструментами, якими розробники вже користуються. Одна інсталяція, чотири агенти, жодних нових workflow.
