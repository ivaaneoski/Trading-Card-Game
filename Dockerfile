# Stage 1: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
RUN npm install
RUN cd apps/backend && npm run build

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared
RUN npm install
RUN cd apps/frontend && npm run build

# Stage 3: Runtime - Backend
FROM node:20-alpine AS backend-runtime
WORKDIR /app
COPY --from=backend-builder /app/apps/backend/dist ./dist
COPY --from=backend-builder /app/apps/backend/node_modules ./node_modules
COPY --from=backend-builder /app/apps/backend/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]

# Stage 4: Runtime - Frontend (nginx)
FROM nginx:alpine AS frontend-runtime
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files \$uri \$uri/ /index.html;
  }
  location /api {
    proxy_pass http://backend:3000;
  }
}
EOF
EXPOSE 80

# Multi-stage output instructions
# Backend: docker build --target backend-runtime -t tcg-backend:latest .
# Frontend: docker build --target frontend-runtime -t tcg-frontend:latest .
