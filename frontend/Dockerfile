# ─── STAGE 1: Build do React/Vite ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# O contexto de build é a raiz do repositório, então prefixamos com frontend/
COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ .
RUN npm run build

# ─── STAGE 2: Servir com Nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada (caminho relativo à raiz do repositório)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

