# ── Stage: Production ──────────────────────────────────────────
FROM node:18-alpine AS production

LABEL org.opencontainers.image.title="SwasthyaSaathi Backend" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.description="Node.js/Express API for SwasthyaSaathi health platform" \
      org.opencontainers.image.authors="mohitsoni2006"

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY . .

# Use the built-in non-root node user for security
USER node

EXPOSE 5000

# Health check — polls the root every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
