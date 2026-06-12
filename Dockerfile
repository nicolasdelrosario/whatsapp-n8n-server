FROM node:22-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN mkdir -p .wwebjs_auth
EXPOSE 3000
CMD ["npm", "run", "start"]
