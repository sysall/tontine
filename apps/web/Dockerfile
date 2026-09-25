# Multi-stage Dockerfile for Web Backoffice (React / Vite)

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY services/api/package.json ./services/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

RUN npm ci

COPY packages/types ./packages/types
COPY apps/web ./apps/web

RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/web

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
