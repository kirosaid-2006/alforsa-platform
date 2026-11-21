# Use official Node.js runtime as parent image
FROM node:20-alpine

# Install build dependencies for native modules (sqlite3, bcrypt, etc.)
RUN apk add --no-cache python3 make g++ gcc

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy project source code
COPY . .

# Expose app port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["npm", "start"]
