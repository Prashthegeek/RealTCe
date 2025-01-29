# # Base image
# FROM ubuntu:22.04

# # Update and install dependencies
# RUN apt-get update && apt-get install -y \
#     curl \
#     build-essential \
#     python3 \
#     python3-pip \
#     openjdk-11-jdk \
#     && apt-get clean

# # Install Node.js
# RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# # Set working directory
# WORKDIR /app

# # Copy backend files
# COPY ./backend ./backend

# # Install backend dependencies
# WORKDIR /app/backend
# RUN npm install

# # Copy frontend files
# WORKDIR /app
# COPY ./frontend ./frontend

# # Install frontend dependencies and build the frontend
# WORKDIR /app/frontend
# RUN npm install
# RUN npm run build RUN npm run build || { echo "Frontend build failed"; exit 1; }


# # Go back to the root directory  
# WORKDIR /app

# # Copy the script to start both services, in run-services.sh , we have written code dealing with build folder. 
# #so,run this part only if build folder is correctly build (so, gave a check while building the build folder,see above )
# COPY ./run-services.sh ./run-services.sh

# # Make the script executable
# RUN chmod +x ./run-services.sh

# # Expose ports (5000 for backend, 3000 for frontend)
# EXPOSE 3000 5000

# # Start the application
# CMD ["./run-services.sh"]



# Base image
FROM ubuntu:22.04

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    python3-pip \
    openjdk-11-jdk \
    && apt-get clean

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy backend files
COPY ./backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy frontend files
WORKDIR /app
COPY ./frontend ./frontend

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build the frontend
RUN npm run build || { echo "Frontend build failed"; exit 1; }

# Go back to the root directory
WORKDIR /app


# Copy the script to start both services
COPY ./run-services.sh ./run-services.sh

# Make the script executable
RUN chmod +x ./run-services.sh

# Expose ports (5000 for backend, 3000 for frontend)
EXPOSE 3000 5000


# we have written code dealing with build folder. 
# #so,run this part only if build folder is correctly build (so, gave a check while building the build folder,see above ),if not build then exit maar do, dont run more codes, deployment will stop
# Start the application
CMD ["./run-services.sh"]