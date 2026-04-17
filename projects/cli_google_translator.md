---
layout: project
title: CLI Google Translator
permalink: /projects/gootrago/
exclude: true
lang: en
lang_alt: /projects/gootrago-ua/
---

[The same in Ukrainian](../gootrago-ua)

**Links:** [GitHub](https://github.com/valpere/gootrago)

## Brief Overview

A command-line tool for translating text using the Google Translate API. Supports multiple languages, accepts input from stdin or as command-line arguments, and outputs translations directly to the terminal — ideal for scripting and automation workflows.

**Tech stack:** Go · Google Translate API · CLI · Docker · Cobra · Viper

## Detailed Overview

### Purpose

GooTraGo was built to enable fast, scriptable translations without leaving the terminal. Traditional translation requires opening a browser; GooTraGo lets you pipe text through it in shell scripts or use it interactively.

### Features

- Translate text between any language pair supported by Google Translate
- Supports both the Basic and Advanced Google Translate APIs
- Accept input from stdin (pipe-friendly) or as CLI arguments
- Advanced API supports Google Cloud Project integration for higher quotas
- Simple, fast binary with minimal runtime dependencies
- Configurable source and target languages via flags

### Usage

```bash
echo "Hello, world" | gootrago --to uk
gootrago --from en --to de "Software engineering"
```

### Open Source

The project is open source and available on GitHub. Contributions and feedback are welcome.

---

*#go #cli #translation #automation #google-translate #docker #cobra #viper*
