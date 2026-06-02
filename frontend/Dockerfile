# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Set build environment variables
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build client assets
RUN npm run build

# Stage 2: Serve the compiled static assets with Nginx
FROM nginx:stable-alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
