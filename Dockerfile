FROM oven/bun:1.2.20-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN mkdir -p .wwebjs_auth
EXPOSE 3000
CMD ["bun", "run", "start"]
