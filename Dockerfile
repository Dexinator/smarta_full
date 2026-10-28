# Use Node.js LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm@12.15.0 && pnpm install --frozen-lockfile

# Copy all project files
COPY . .

# Expose the port Astro runs on
EXPOSE 4321

# Start the development server
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]