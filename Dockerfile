# # Base image
# FROM ubuntu:22.04

# # Install dependencies & Docker Engine (not just CLI)
# RUN apt-get update && apt-get install -y \
#     curl \
#     build-essential \
#     python3 \
#     python3-pip \
#     openjdk-11-jdk \
#     apt-transport-https \
#     ca-certificates \
#     gnupg \
#     lsb-release \
#     docker.io \
#     && apt-get clean

# # Install Node.js
# RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# # Set working directory
# WORKDIR /app

# # Copy backend files
# COPY ./backend ./backend

# # Install backend dependencies
# WORKDIR /app/backend
# RUN npm install --omit=dev

# # Copy frontend files
# WORKDIR /app
# COPY ./frontend ./frontend

# # Install frontend dependencies
# WORKDIR /app/frontend
# RUN npm install --omit=dev

# # Ensure `vite` is installed (either globally or locally)
# RUN npm install vite --save-dev

# # Build the frontend
# RUN npm run build || { echo "❌ Frontend build failed. Exiting deployment."; exit 1; }

# # Go back to the root directory
# WORKDIR /app

# # Copy the script to start both services
# COPY ./run-services.sh ./run-services.sh

# # Make the script executable
# RUN chmod +x ./run-services.sh

# # Ensure Docker socket permissions (avoid permission issues)
# RUN mkdir -p /var/run && touch /var/run/docker.sock && chmod 777 /var/run/docker.sock

# # Expose ports (5000 for backend, 3000 for frontend)
# EXPOSE 3000 5000

# # Start the application
# CMD ["bash", "-c", "[ -f ./run-services.sh ] && ./run-services.sh || echo '❌ run-services.sh not found. Exiting.'"]




# Base image
FROM ubuntu:22.04

# Install dependencies and only the Docker client (not the full docker.io) (including software-properties-common)
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
    software-properties-common \
    && apt-get clean

# Install Docker client (docker-ce-cli) from Docker's repository
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
    add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable" && \
    apt-get update && \
    apt-get install -y docker-ce-cli

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

# Ensure Vite is installed (either globally or locally)
RUN npm install vite --save-dev

# Build the frontend
RUN npm run build || { echo "❌ Frontend build failed. Exiting deployment."; exit 1; }

# Go back to the root directory
WORKDIR /app

# Copy the script to start both services
COPY ./run-services.sh ./run-services.sh

# Make the script executable
RUN chmod +x ./run-services.sh

# (Optional) Create the Docker socket file with proper permissions.
# This step is often unnecessary if you're mounting the host's socket.
RUN mkdir -p /var/run && touch /var/run/docker.sock && chmod 777 /var/run/docker.sock

# Expose ports (5000 for backend, 3000 for frontend)
EXPOSE 3000 5000

# Start the application
CMD ["bash", "-c", "[ -f ./run-services.sh ] && ./run-services.sh || echo '❌ run-services.sh not found. Exiting.'"]



#We’ve removed the installation of docker.io (which installs the Docker daemon) and instead install the Docker client (docker-ce-cli) so that your container can issue Docker commands.
# The rest of the Dockerfile builds both backend and frontend as before.
# The run-services.sh script will run inside this container, but now when it calls docker pull …, it will use the host’s Docker daemon if the host’s socket is mounted.