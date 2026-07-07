FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS install
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM base AS runtime
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    dumb-init \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN mkdir -p .wwebjs_auth \
  && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["dumb-init", "npm", "run", "start"]
