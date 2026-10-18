# Production Dockerfile for Google Cloud Run / Render.com
FROM node:22-alpine

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source files
COPY . .

# Build frontend production bundle
RUN npm run build

# Cloud Run injects PORT (default 8080 or 3000)
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start authoritative Node.js + Socket.io server
CMD ["npx", "tsx", "server.ts"]
