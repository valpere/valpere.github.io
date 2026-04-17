---
layout: project
title: Twitter-like REST API
permalink: /projects/testwigr/
exclude: true
lang: en
lang_alt: /projects/testwigr-ua/
---

[The same in Ukrainian](../testwigr-ua)

**Links:** [GitHub](https://github.com/valpere/testwigr)

## Brief Overview

A fully-featured Twitter-like REST API built with Groovy and Spring Boot, backed by MongoDB. Implements user registration and authentication (JWT), tweet CRUD operations, liking, commenting, following/follower relationships — a complete social platform backend with Swagger/OpenAPI documentation.

**Tech stack:** Groovy · Spring Boot · MongoDB · JWT · REST API · Swagger · OpenAPI

## Detailed Overview

### Purpose

TestWigr was built as a demonstration of how to architect a scalable social media backend with Groovy and Spring Boot. It showcases real-world patterns: JWT-based authentication, relationship management, and social interaction features.

### API Features

- **Authentication:** JWT-based register/login with Spring Security
- **Users:** profile management, follow/unfollow relationships
- **Tweets:** create, read, update, delete
- **Social:** likes and comments on tweets
- **Timeline:** aggregated feed of followed users' tweets
- **Documentation:** Swagger/OpenAPI spec for all endpoints

### Architecture

- **Language:** Groovy
- **Framework:** Spring Boot with Spring Security, Spring Data MongoDB
- **Database:** MongoDB
- **Auth:** JWT tokens via Spring Security
- **Testing:** JUnit 5 and Spock Framework
- **Docs:** Swagger/OpenAPI

### Open Source

Full source available on GitHub with setup instructions and API documentation in the README.

---

*#groovy #spring-boot #mongodb #rest-api #jwt #backend #social-media #swagger #openapi*
