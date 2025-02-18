# Stage 1: Build aplikasi Next.js
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install semua dependencies (termasuk husky)
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Jalankan aplikasi dengan base image yang lebih kecil
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

# Hanya simpan dependencies produksi
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]