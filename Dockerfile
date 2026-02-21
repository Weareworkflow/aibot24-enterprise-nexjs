FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and build
COPY . .

# Next.js telemetry (optional: disable for privacy)
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Start the application
EXPOSE 9002
ENV PORT=9002
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]

