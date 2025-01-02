FROM node:20 AS base

FROM base AS builder
WORKDIR /code
COPY . .
RUN cd server && npm ci && npm run build

FROM base AS final
WORKDIR /app
COPY --from=builder /code/server/*.js ./
COPY --from=builder /code/server/*.json ./
COPY --from=builder /code/server/controllers ./controllers/
COPY --from=builder /code/server/routes ./routes/
COPY --from=builder /code/server/node_modules ./node_modules/
COPY --chmod=555 docker-entrypoint.sh .
ENTRYPOINT ["/app/docker-entrypoint.sh"]
