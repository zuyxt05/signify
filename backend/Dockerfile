# ========================
# Stage 1: Build
# ========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# ========================
# Stage 2: Production
# ========================
FROM node:20-alpine

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app .

# Expose port
EXPOSE 8080

USER appuser

CMD ["node", "src/server.js"]
