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

# Function to open browser when server is ready
open_browser() {
    # Wait for the server to start
    sleep 3

    # Check if server is running, keep trying for 30 seconds
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            open http://localhost:5173
            return 0
        fi
        sleep 1
    done

    echo "Server didn't start in time. Please open http://localhost:5173 manually."
}

# Start browser opener in background
open_browser &

# Start the development server
echo "Starting eBay Feed Viewer..."
echo "The app will open in your browser automatically."
echo "Press Ctrl+C to stop the server."
echo ""

npm run dev
