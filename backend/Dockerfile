# Multi-stage build for Node.js backend
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install production dependencies only
RUN npm install --production

# Copy built application from development stage
COPY --from=development /app/dist ./dist

# Start the application
CMD ["node", "dist/server.js"]