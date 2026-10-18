# Production Dockerfile for Render.com / Cloud Containers
FROM node:22-slim

WORKDIR /app

# Copy package manifests and .npmrc
COPY package*.json .npmrc ./

# Install all dependencies with resilience
RUN npm install --legacy-peer-deps

# Copy application source files
COPY . .

# Build frontend production bundle
RUN npm run build

# Render injects $PORT (default 10000), fallback to 3000
ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

# Start authoritative Node.js + Express + Socket.io server
CMD ["npx", "tsx", "server.ts"]
