#!/bin/bash

# Create upload directories
mkdir -p uploads/profiles uploads/events uploads/posts

# Check if port 5002 is in use and kill it if necessary
PORT=5002
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Port $PORT is in use. Attempting to kill the process..."
    lsof -ti:$PORT | xargs kill -9
    echo "Killed process using port $PORT"
    sleep 1 # Wait for the port to be released
fi

# Start the server with ts-node in transpile-only mode
echo "Starting server on port $PORT..."
npx nodemon --exec "npx ts-node --transpile-only" src/index.ts 