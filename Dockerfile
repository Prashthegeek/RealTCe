# Base image
FROM ubuntu:22.04

# Install dependencies & Docker Engine (not just CLI)
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    python3-pip \
    openjdk-11-jdk \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    docker.io \
    && apt-get clean

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy backend files
COPY ./backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy frontend files
WORKDIR /app
COPY ./frontend ./frontend

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install --omit=dev

# Build the frontend
RUN npm run build || { echo "❌ Frontend build failed. Exiting deployment."; exit 1; }

# Go back to the root directory
WORKDIR /app

# Copy the script to start both services
COPY ./run-services.sh ./run-services.sh

# Make the script executable
RUN chmod +x ./run-services.sh

# Ensure Docker socket permissions (avoid permission issues)
RUN mkdir -p /var/run && touch /var/run/docker.sock && chmod 777 /var/run/docker.sock

# Expose ports (5000 for backend, 3000 for frontend)
EXPOSE 3000 5000

# Start the application
CMD ["bash", "-c", "[ -f ./run-services.sh ] && ./run-services.sh || echo '❌ run-services.sh not found. Exiting.'"]
