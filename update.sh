#!/bin/bash
LOGFILE="/home/ec2-user/update.log"
exec > >(tee -i $LOGFILE)
exec 2>&1

echo "Resetting to latest version from GitHub..."
cd /home/ec2-user/25-316-financial-capture-analysis
git fetch --all
# Force update all files to match GitHub
git reset --hard origin/main  
 # Ensure latest changes are applied
git pull origin main 

echo "Restarting Flask backend..."
sudo pkill -f flask_app.py
nohup python3 src/flask_app.py > backend.log 2>&1 &

echo "Restarting React frontend..."
sudo pkill -f node
nohup npm start > frontend.log 2>&1 &

echo "Full reset and update complete!"
