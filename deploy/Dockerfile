FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ARG SERVICE
COPY ${SERVICE}/package*.json ./
RUN npm ci --no-audit --no-fund
COPY ${SERVICE}/ ./
COPY proto/ ./proto/
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi
RUN npm run build && mkdir -p dist/proto && cp proto/*.proto dist/proto/
RUN npm prune --omit=dev --ignore-scripts

FROM node:22-bookworm-slim AS production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ARG SERVICE
ENV NODE_ENV=production SERVICE=${SERVICE}
COPY --from=build --chown=node:node /app/ ./
COPY --chown=node:node deploy/entrypoint.sh deploy/seed.cjs ./deploy/
USER node
ENTRYPOINT ["sh", "/app/deploy/entrypoint.sh"]
CMD ["node", "dist/main.js"]
