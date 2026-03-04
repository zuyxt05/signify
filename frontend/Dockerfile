# ========================
# Stage 1: Build React App
# ========================
FROM node:20-alpine AS builder

WORKDIR /app

# Increase Node memory for React build
ENV NODE_OPTIONS=--max-old-space-size=4096

COPY package*.json ./
RUN npm install --legacy-peer-deps

# Build args → env vars at build time
ARG REACT_APP_SERVER_URL
ARG REACT_APP_WEBSOCKET_URL

ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL
ENV REACT_APP_WEBSOCKET_URL=$REACT_APP_WEBSOCKET_URL

COPY . .
RUN npm run build

# ========================
# Stage 2: Serve with Nginx
# ========================
FROM nginx:alpine

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
