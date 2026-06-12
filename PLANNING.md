# Planning

## Goal

Keep this backend focused on one responsibility: expose a stable HTTP API for WhatsApp automation while remaining easy to deploy, inspect and extend.

## Current architecture

### Runtime entrypoints

- `src/index.ts` exports the Hono app for Node adapters and tests.
- `src/app.ts` bootstraps the HTTP server and starts the WhatsApp client.

### Shared layer

- `src/lib/Shared/infrastructure/config/env.ts` loads and validates environment variables.
- `src/lib/Shared/infrastructure/hono/createApp.ts` creates the Hono instance and registers global middleware.
- `src/lib/Shared/infrastructure/routes/*` groups route registration by concern.
- `src/lib/Shared/infrastructure/openapi/openapi.ts` owns the OpenAPI document and Scalar UI HTML.

### WhatsApp feature layer

- `src/lib/Whatsapp/domain` holds the core model, value objects and exceptions.
- `src/lib/Whatsapp/application` holds the use cases.
- `src/lib/Whatsapp/infrastructure` adapts WhatsApp Web, HTTP controllers, route definitions and request schemas.

## Routing map

Base path: `/api/v1`

Public routes:

- `GET /api/v1/` redirects to the documentation UI.
- `GET /api/v1/health` returns a lightweight health response.
- `GET /api/v1/openapi.json` serves the API contract.
- `GET /api/v1/docs` serves Scalar.

Protected routes:

- `GET /api/v1/qr-code`
- `POST /api/v1/send-message`
- `POST /api/v1/reply-message`
- `POST /api/v1/broadcast-message`

## Implementation notes

- Request bodies should be validated at the controller boundary.
- Domain value objects should own their own invariants.
- Controllers should map domain errors to HTTP status codes and avoid leaking transport logic into the service layer.
- OpenAPI should stay aligned with the same request/response contracts used by the controllers.
- The Docker image should preserve the WhatsApp session directory so authenticated sessions survive restarts.

## Recommended follow-up work

1. Add automated tests for controllers and use cases.
2. Add a `/metrics` or `/health/live` endpoint if deployment tooling needs finer-grained checks.
3. Decide whether the Scalar UI should remain public or be protected behind the API key in production.
4. Consider replacing the manual OpenAPI document with generated schemas if the API surface grows.
