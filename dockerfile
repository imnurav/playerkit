# Build Stage
FROM node:24-alpine AS builder

ENV CI=true

RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

# Production Stage
FROM nginx:alpine

COPY --from=builder /app/apps/playground/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]