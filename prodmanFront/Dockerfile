# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Expose port
EXPOSE 4200

# Default command (can be overridden in docker-compose)
CMD ["npm", "start"]
