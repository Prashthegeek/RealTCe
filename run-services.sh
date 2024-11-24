#!/bin/bash

# Start the backend server in the background
cd /app/backend
npm start &

# Serve the frontend build , running npm run build generates the dist folder in frontend
cd /app/frontend/dist  
npx serve -s . -l 3000   
