# Optional container image for self-hosting outside Vercel. The primary
# deployment target is Vercel (see docs/DEPLOYMENT.md) — Vercel does not use
# this file at all.
FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
