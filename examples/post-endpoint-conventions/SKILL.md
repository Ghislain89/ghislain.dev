---
name: post-endpoint-conventions
description: >
  Teaches how this team builds POST command endpoints — hexagonal layering,
  request validation, and the tests we expect. Use whenever adding or changing
  a state-changing POST endpoint.
metadata:
  version: '0.1.0'
  layer: command-adapter
  authors:
    - name: Your Name
      email: you@example.com
  tags:
    - example
    - conventions
    - command-endpoint
---

# POST Command Endpoint Conventions

Use this skill whenever you add or change a POST endpoint that creates or
changes state.

## What good looks like

- **Hexagonal architecture.** Keep business logic in the domain, not in the
  REST resource. The resource only translates HTTP into a command.
- **Validate input.** Validate request DTOs with Jakarta validation. Reject
  bad requests before they reach the domain.
- **Don't leak the domain.** Map to a response DTO; never serialize the
  aggregate directly.
- **Idempotency.** A retried create must not produce a duplicate order.

## Tests we expect

- A **command endpoint test** covering the happy path and validation failures.
- A **component test** that exercises the endpoint against a real wiring.

## References

- [command-resource-example.md](command-resource-example.md)
- [command-test-example.md](command-test-example.md)

> This file teaches; it executes nothing. The agent reads it and applies the
> rules. That is the entire difference between a skill and an agent.
