# WhatsApp n8n Server

WhatsApp n8n Server exposes a small REST API for sending, replying and broadcasting WhatsApp messages through [`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js). It follows a Clean Architecture style, keeps the HTTP layer thin, and ships with OpenAPI documentation plus a Scalar UI.

## What it provides

- REST API with API key protection
- QR code bootstrap flow for WhatsApp Web authentication
- Send, reply and broadcast message use cases
- Health check endpoint for deployments
- OpenAPI 3.1 document and Scalar docs UI
- Docker-based deployment for VPS environments

## Project structure

The backend is organized by layer instead of by transport:

- `src/lib/Shared`: cross-cutting infrastructure, HTTP helpers, configuration, routes and docs
- `src/lib/Whatsapp/domain`: domain models, value objects and exceptions
- `src/lib/Whatsapp/application`: use cases
- `src/lib/Whatsapp/infrastructure`: WhatsApp client adapter, services, controllers, routes and schemas

The entry point is `src/app.ts`, which builds the Hono app, registers routes and starts the WhatsApp client.

## Requirements

- Node.js 20 or newer
- Docker and Docker Compose for containerized deployment
- A WhatsApp account on a phone with WhatsApp installed
- A valid `x-api-key` for protected requests

## Local setup

1. Install dependencies.

```bash
bun install
```

2. Create your environment file.

```bash
cp .env.example .env
```

3. Configure the values.

```env
PORT=3000
NODE_ENV=development
API_KEY=your-api-key
BROADCAST_DELAY_MS=1500
```

4. Start the server.

```bash
bun dev
```

On the first run, the terminal prints a QR code. Scan it with WhatsApp to authorize the session. The browser session is persisted through `LocalAuth`.

## API surface

Base URL:

```text
http://localhost:3000/api/v1
```

Public endpoints:

- `GET /api/v1/health`
- `GET /api/v1/openapi.json`
- `GET /api/v1/docs`

Protected endpoints require:

```http
x-api-key: your-api-key
```

Endpoints:

- `GET /api/v1/qr-code`
- `POST /api/v1/send-message`
- `POST /api/v1/reply-message`
- `POST /api/v1/broadcast-message`

## Example requests

### Send a message

```bash
curl -X POST http://localhost:3000/api/v1/send-message \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-api-key' \
  -d '{"chatId":"51123456789","message":"Hello from WhatsApp n8n Server"}'
```

### Reply to a message

```bash
curl -X POST http://localhost:3000/api/v1/reply-message \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-api-key' \
  -d '{"chatId":"51123456789","messageId":"MESSAGE_ID","message":"Reply message"}'
```

### Broadcast a message

```bash
curl -X POST http://localhost:3000/api/v1/broadcast-message \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-api-key' \
  -d '{"chatIds":["51123456789","51987654321"],"message":"Hello everyone"}'
```

## Documentation

- OpenAPI spec: `GET /api/v1/openapi.json`
- Scalar UI: `GET /api/v1/docs`

## Deployment

Use Docker for a repeatable VPS deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full procedure.

## Notes

- Keep the API key private and use HTTPS in production.
- Broadcast requests use a configurable delay to avoid aggressive sending.
- The WhatsApp session lives in `.wwebjs_auth`, so persist that directory if you run outside Docker.
