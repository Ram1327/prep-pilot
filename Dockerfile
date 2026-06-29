# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy application source files
COPY . .

# Run production build
RUN npm run build

# Stage 2: Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set container environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy package configurations to install production-only dependencies
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built static client files and compiled server from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 8080

# Command to start the application
CMD ["node", "dist/server.cjs"]
