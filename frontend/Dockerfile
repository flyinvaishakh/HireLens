# ────────────────────────────────────────────────────────────
#  HireLens Frontend — Multi-Stage Dockerfile
#  Stage 1: Vite build (node:20-alpine)
#  Stage 2: Serve static assets (nginx:alpine)
# ────────────────────────────────────────────────────────────

# ═══════════════════════════════════════════════════════════
#  Stage 1 — Build
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS build

WORKDIR /app

# Accept Vite build-time variables as build args.
# These MUST be set as ENV so Vite's import.meta.env embeds them.
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ARG VITE_STREAM_API_KEY

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STREAM_API_KEY=$VITE_STREAM_API_KEY

# ── Layer-cached dependency install ──────────────────────────
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# ── Copy source & build ─────────────────────────────────────
COPY . .
RUN npm run build

# ═══════════════════════════════════════════════════════════
#  Stage 2 — Production (nginx)
# ═══════════════════════════════════════════════════════════
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
