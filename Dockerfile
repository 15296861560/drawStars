# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY package.json pnpm-lock.yaml .pnpmfile.cjs ./
RUN pnpm install --no-frozen-lockfile
COPY . .
# 拾星趣局管理 key：构建期烧入 bundle，须与后端 PARTY_ADMIN_KEY 一致（留空则前端代码回退 party-admin-dev）
ARG VITE_PARTY_ADMIN_KEY=''
ENV VITE_PARTY_ADMIN_KEY=$VITE_PARTY_ADMIN_KEY
RUN pnpm build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
ENV API_UPSTREAM=api:8010
EXPOSE 80
