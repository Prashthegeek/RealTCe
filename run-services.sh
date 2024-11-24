#!/bin/bash

# Start the backend server in the background
cd /app/backend
npm start &

# Serve the frontend build
cd /app/frontend/build
npx serve -s . -l 3000
