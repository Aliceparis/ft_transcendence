# ---- Build Stage ----
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./

COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# 去掉 --frozen-lockfile，改用 --no-frozen-lockfile
RUN pnpm install --no-frozen-lockfile

COPY shared/ ./shared/
COPY backend/ ./backend/

RUN pnpm --filter @myapp/shared build
RUN pnpm --filter backend build

# ---- Production Stage ----
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN pnpm install --no-frozen-lockfile --prod

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]