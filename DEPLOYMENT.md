# Deployment

## Recommended approach

Deploy this project with Docker on a VPS. The server needs a stable runtime, persistent storage for the WhatsApp session, and a reverse proxy if you want HTTPS.

## Build artifacts

- Application image: Node.js 22 LTS runtime with the project installed
- Persistent volume: stores `.wwebjs_auth` for local session persistence and `whatsapp-web.js` working files
- Optional reverse proxy: Nginx, Caddy or Traefik

## Files included

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

## Environment variables

Use the same variables as `.env.example`:

```env
PORT=3000
NODE_ENV=production
API_KEY=replace-with-a-long-random-secret
BROADCAST_DELAY_MS=1500
POSTGRES_URL=
```

`POSTGRES_URL` is optional. When it is empty, the container uses local filesystem session storage in `.wwebjs_auth`. When it is set, the container uses PostgreSQL-backed `RemoteAuth` and creates the `wwebjs_sessions` table automatically.

## Docker Compose workflow

1. Build the image.

```bash
docker compose build
```

2. Start the service.

```bash
docker compose up -d
```

3. Check the logs and scan the QR code on first start.

```bash
docker compose logs -f app
```

4. Verify the health endpoint.

```bash
curl http://YOUR_VPS_IP:3000/api/v1/health
```

## Production notes

- Keep `API_KEY` out of the repository and use a secret manager if possible.
- Persist the `whatsapp-session` volume when `POSTGRES_URL` is not set so the QR login is not required after every restart.
- Use an external PostgreSQL database and set `POSTGRES_URL` if the container filesystem is ephemeral or you deploy across hosts.
- Put the service behind HTTPS before exposing it to the internet.
- Rotate the API key if it is ever exposed.

## Operational checklist

- Confirm the container starts cleanly after a reboot.
- Confirm the session folder is mounted and writable, or confirm `POSTGRES_URL` points to a reachable PostgreSQL database.
- Confirm the QR code only appears on first authentication or when the session is invalidated.
- Confirm your reverse proxy forwards `x-api-key` unchanged.
