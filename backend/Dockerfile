# ────────────────────────────────────────────────────────────
#  HireLens Backend — Production Dockerfile
#  Base: node:20-alpine  |  Entrypoint: node src/server.js
# ────────────────────────────────────────────────────────────

FROM node:20-alpine AS production

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# ── Layer-cached dependency install ──────────────────────────
# Copy only package manifests first so npm ci is cached until
# dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Copy application source ─────────────────────────────────
COPY . .

# Switch to non-root user
USER appuser

EXPOSE 5000

CMD ["node", "src/server.js"]
