#!/bin/bash

PORT=${1:-8080}

echo "🚀 Starting SIPp Scenario Designer on port $PORT..."
echo ""
echo "📝 The designer will be available at:"
echo "   http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

if command -v python3 &> /dev/null; then
    echo "Using Python 3 HTTP server..."
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "Using Python 2 HTTP server..."
    python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    echo "Using npx serve..."
    npx serve . -l $PORT
else
    echo "❌ Error: No suitable HTTP server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3: apt-get install python3"
    echo "  - Node.js: https://nodejs.org/"
    echo ""
    echo "Or open index.html directly in your browser."
    exit 1
fi
