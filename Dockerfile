# Production Dockerfile for Cloud Containers & Render.com
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

# Default to port 3000 (Render/Cloud Run automatically override $PORT at runtime)
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Start authoritative Node.js + Express + Socket.io server
CMD ["npx", "tsx", "server.ts"]
