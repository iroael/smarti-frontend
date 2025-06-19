# Stage builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files dan install dependencies (full, termasuk dev)
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

# Copy seluruh source code lalu build
COPY . .

RUN pnpm run build


# Stage production
FROM node:22-alpine

WORKDIR /app

# Copy package files dan install full dependencies (jangan --prod karena butuh nuxt)
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

# Copy hasil build dari builder (.output biasanya hasil build Nuxt 3)
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Jalankan nuxt dengan pnpm exec supaya binary nuxt ketemu
CMD ["pnpm", "exec", "nuxt", "start"]

