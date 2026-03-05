# Build Stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --production --legacy-peer-deps
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 9002
ENV PORT=9002
ENV NODE_ENV=production

CMD ["npm", "start"]
