#!/bin/bash

# eBay Feed Viewer - Desktop Launcher
# Double-click this file to start the app

# Change to the project directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if server is already running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "Server already running. Opening browser..."
    open http://localhost:5173
    osascript -e 'tell application "Terminal" to close front window' &
    exit 0
fi

# Start the development server in background
echo "Starting eBay Feed Viewer..."
nohup npm run dev > /dev/null 2>&1 &

# Wait for server to be ready and open browser
(
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            open http://localhost:5173
            exit 0
        fi
        sleep 1
    done
    echo "Server didn't start in time. Please open http://localhost:5173 manually."
) &

# Give it a moment then close the terminal window
sleep 2
osascript -e 'tell application "Terminal" to close front window' &
exit 0
