#!/bin/bash

# Internship Application Form - Quick Start Script

echo "======================================"
echo "Mira Future Tech Pvt Ltd"
echo "Internship Application System Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Python
echo -e "${BLUE}Checking Python installation...${NC}"
if command -v python &> /dev/null; then
    python_version=$(python --version)
    echo -e "${GREEN}✓ Python found: $python_version${NC}"
else
    echo "✗ Python not found. Please install Python 3.8+"
    exit 1
fi

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $node_version${NC}"
else
    echo "✗ Node.js not found. Please install Node.js 14+"
    exit 1
fi

echo ""
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start backend in background
echo -e "${GREEN}✓ Backend setup complete${NC}"
echo "Starting FastAPI server..."
python main.py &
BACKEND_PID=$!

cd ..
echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend

# Install Node dependencies
echo "Installing Node dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

echo "======================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "======================================"
echo ""
echo "To start development:"
echo "1. Backend is running on: http://localhost:8000"
echo "2. Start frontend in frontend folder: npm start"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo ""

cd ..
