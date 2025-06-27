
# Pull necessary language images
docker pull python:3.9-slim &
docker pull node:14-slim &
docker pull gcc:latest &
docker pull openjdk:11-slim &

# Wait for all pulls to complete
wait

echo "✅ Language images pulled. Starting backend..."

# Start backend server
npm start