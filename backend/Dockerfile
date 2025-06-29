
# # Base image

# FROM ubuntu:22.04

# # Install dependencies and only the Docker client (not the full docker.io) (including software-properties-common)
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
#     software-properties-common \
#     && apt-get clean

# # Install Docker client (docker-ce-cli) from Docker's repository
# RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
#     add-apt-repository \
#    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
#    $(lsb_release -cs) \
#    stable" && \
#     apt-get update && \
#     apt-get install -y docker-ce-cli

# # Install Node.js
# RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# # Set working directory
# WORKDIR /app

# # Copy the script to start both services ( copy src dest) (layer caching ke karaan isko abhi copy kar rahe hai , because this file is not going to change always)
# COPY run-services.sh ./run-services.sh
# #give this file necessary permission(since, when  files are copied inside docker container ,they are not copied with their permission, so permission denied error aayega when ye file docker images ko pull karega, so give permission of execution(+X) to it  )
# RUN chmod +x ./run-services.sh  


# # Copy package files separately & install deps (layer caching)
# COPY package*.json ./

# # Install backend dependencies
# RUN npm install --omit=dev


# # Copy rest of the backend files(which changes always) ( Dockerfile is in the root of backend folder ,so isi root ke items will get copied   )
# COPY . .

# #inside the docker container (we will have app directory , inside which we will have all the content of the backend folder directly without backend directory) (so, /app / all contents like Dockerfile , runservices.sh, controllers, models ... directly )


# # (Optional) Create the Docker socket file with proper permissions.
# # This step is often unnecessary if we are mounting the host's socket.
# RUN mkdir -p /var/run && touch /var/run/docker.sock && chmod 777 /var/run/docker.sock

# # Expose ports (5000 for backend)
# EXPOSE  5000

# # Start backend + pre-pull compiler images
# CMD ["bash", "-c", "[ -f ./run-services.sh ] && ./run-services.sh || echo '❌ run-services.sh not found. Exiting.'"]



#We’ve removed the installation of docker.io (which installs the Docker daemon) and instead install the Docker client (docker-ce-cli) so that your container can issue Docker commands.
# The rest of the Dockerfile builds both backend and frontend as before.
# The run-services.sh script will run inside this container, but now when it calls docker pull …, it will use the host’s Docker daemon if the host’s socket is mounted.



# Use a lightweight Node base image
FROM node:18-slim

# Install required packages and Docker CLI (client only)
RUN apt-get update && apt-get install -y \
    curl \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update && apt-get install -y docker-ce-cli \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the script to start both services ( copy src dest) (layer caching ke karaan isko abhi copy kar rahe hai , because this file is not going to change always)

COPY run-services.sh ./run-services.sh


# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev


# Copy rest of the backend files(which changes always) ( Dockerfile is in the root of backend folder ,so isi root ke items will get copied   )
COPY . .


#give this file necessary permission(since, when  files are copied inside docker container ,they are not copied with their permission, so permission denied error aayega when ye file docker images ko pull karega, so give permission of execution(+X) to it  )
# Copy it again and set permissions
COPY run-services.sh ./run-services.sh
RUN chmod +x ./run-services.sh 

#inside the docker container (we will have app directory , inside which we will have all the content of the backend folder directly without backend directory) (so, /app / all contents like Dockerfile , runservices.sh, controllers, models ... directly )

# Expose backend port
EXPOSE 5000

# Optional healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:5000/health || exit 1

#yaha tak ka code execute hua hai during build time 
# Start the backend server (also pulls language images via run-services.sh) 
#neeche wala codes will run only at the run time , and at run time we will give access to /var/run/docker.sock using -v flag 
#so, at run time , run services.sh ke inside docker images will be pulled without any difficuly since ,at the run time backend container has the access to /var/run/docker.sock 
CMD ["sh","./run-services.sh"]

#inside the run services.sh , we will pre pull the images and then run the backend using npm start directly ,
#agar, Dockerfile se backend ko start karna hota then -> CMD ["npm", "start"] karte ,but ye bhi run time me hi hota when -> docker run ... wala command aata.