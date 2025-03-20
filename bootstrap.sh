#!/bin/bash

# Set up logging
LOGFILE="/home/ec2-user/setup.log"
exec > >(tee -i $LOGFILE)
exec 2>&1

echo "Starting Bootstrap Setup"

# Update System packages
echo "Updating system"
sudo yum update -y

# Install packages
echo "Installing packages"
sudo yum install -y git python3 python3-pip nodejs npm

# Clone repo
GIT_REPO="https://github.com/VCU-CS-Capstone/25-316-financial-capture-analysis.git"
PROJECT_DIR="/home/ec2-user/25-316-financial-capture-analysis"

echo "Cloning repository"
if [ ! -d "$PROJECT_DIR" ]; then
    git clone $GIT_REPO $PROJECT_DIR
else
    echo "Repository already exists, pulling latest changes"
    cd $PROJECT_DIR
    git pull origin main || git pull origin master
fi

cd $PROJECT_DIR/src

sleep 5

if [ -d "Public" ]; then
    mv Public public
fi

# Set Up Python Virtual Environment
echo "Setting up Python virtual environment."
cd $PROJECT_DIR
python3 -m venv venv
source venv/bin/activate

# Python dependencies
echo "Installing Python dependencies."
pip install --upgrade pip
pip install flask
pip install boto3
pip freeze > requirements.txt
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt 
else
    echo ""
fi

# Node and react
echo "Installing JS dependencies."
cd $PROJECT_DIR/src
npm install

# React
echo "Building React frontend."
npm run build

# Build Project
echo "Building project"
cd $PROJECT_DIR/src
source ../venv/bin/activate
nohup python3 flask_app.py &   # Start Flask in the background
nohup npm start &   # Start React in the background

echo "Build complete!"
