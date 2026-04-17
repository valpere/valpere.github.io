---
layout: project
title: TryTraGo Dictionary
permalink: /projects/trytrago/
exclude: true
lang: en
lang_alt: /uk/projects/trytrago/
---

[The same in Ukrainian](../trytrago-ua)

**Links:** [GitHub](https://github.com/valpere/trytrago)

## Brief Overview

TryTraGo is a high-performance multi-language dictionary API server written in Go. Designed to support approximately 60 million dictionary entries, it provides both REST and gRPC interfaces for managing vocabulary entries, definitions, translations, and social features — a robust foundation for language-learning applications.

**Tech stack:** Go · REST API · gRPC · PostgreSQL · Redis · Gin · GORM · Docker · JWT

## Detailed Overview

### Purpose

TryTraGo serves as the backend engine for dictionary and language-learning applications. It stores and retrieves vocabulary entries with full metadata: definitions, examples, synonyms, and cross-language translations — at scale.

### Features

- **Dictionary management:** CRUD for entries with multilingual definitions
- **Search:** fast prefix and exact-match lookup
- **gRPC + REST:** dual transport layer for flexibility
- **Social features:** user contributions and interactions
- **Caching:** Redis for fast repeated lookups
- **Auth:** JWT-based authentication
- **Storage:** PostgreSQL with GORM for relational data at scale
- **Extensible:** designed to support multiple languages and scripts

### Architecture

- **Transport:** gRPC (primary) + REST gateway via Gin
- **Database:** PostgreSQL with GORM ORM
- **Cache:** Redis
- **Auth:** JWT tokens
- **Language:** Go
- **CLI:** Cobra + Viper for configuration
- **Docs:** Swagger/OpenAPI
- **Deployment:** Docker + Docker Compose

### Open Source

Available on GitHub. Designed to be embedded in larger language-learning platforms or used as a standalone reference service.

---

*#go #grpc #postgresql #redis #gin #gorm #dictionary #language-learning #backend #docker*
