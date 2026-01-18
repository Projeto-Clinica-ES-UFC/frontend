# Stage 1: Build
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# Build the app (Vite)
RUN bun run build

# Stage 2: Serve
FROM nginx:alpine
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
