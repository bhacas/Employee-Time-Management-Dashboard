# Etap 1: budowanie aplikacji
FROM node:20-alpine AS build

WORKDIR /app

# Instalacja zależności
COPY package.json package-lock.json* ./
RUN npm install

# Kopiowanie źródeł
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Budowanie aplikacji Vite
RUN npm run build

# Etap 2: serwowanie statycznych plików przez Nginx
FROM nginx:alpine

# Kopiowanie plików z etapu build
COPY --from=build /app/dist /usr/share/nginx/html

# (Opcjonalnie) podmieniamy domyślną konfigurację nginx dla SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]