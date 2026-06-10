FROM node:24-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm run typecheck:libs

RUN BASE_PATH=/ PORT=3000 NODE_ENV=production pnpm --filter @workspace/sigit run build

RUN NODE_ENV=production pnpm --filter @workspace/api-server run build

FROM node:24-slim AS production
WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/sigit/dist ./artifacts/sigit/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
