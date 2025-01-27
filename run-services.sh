#!/bin/bash

# Pull required Docker images in background
docker pull python:3.9 &
docker pull node:14 &
docker pull gcc:latest &
docker pull openjdk:11 &

# Wait for all pulls to complete
wait

# Start the backend server in the background
cd /app/backend
npm start &

# Serve the frontend build
cd /app/frontend/dist
npx serve -s . -l 3000
