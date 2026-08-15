# ============================================================
# Build stage
# ============================================================

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ============================================================
# Runtime stage
# ============================================================

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["npm", "run", "start"]