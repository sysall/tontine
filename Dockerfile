# Multi-stage Dockerfile for Tontine Express Monorepo (API Service - Firestore / Redis)

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY services/api/package.json ./services/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

RUN npm ci

COPY packages/types ./packages/types
COPY services/api ./services/api

RUN npm run build --workspace=packages/types
RUN npm run build --workspace=services/api

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/services/api/package.json ./services/api/package.json

EXPOSE 3000

WORKDIR /app/services/api

CMD ["node", "dist/main.js"]
