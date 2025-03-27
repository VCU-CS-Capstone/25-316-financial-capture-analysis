#!/bin/bash
LOGFILE="/home/ec2-user/update.log"
exec > >(tee -i "$LOGFILE")
exec 2>&1

REPO_DIR="/home/ec2-user/25-316-financial-capture-analysis"
REMOTE="origin"
BRANCH="main"

function full_update {
    echo "Performing full update..."
    cd "$REPO_DIR" || exit 1
    git fetch --all
    git reset --hard "$REMOTE/$BRANCH"
    git pull "$REMOTE" "$BRANCH"

    echo "Restarting Flask backend..."
    sudo pkill -f flask_app.py
    nohup python3 src/flask_app.py > backend.log 2>&1 &

    echo "Restarting React frontend..."
    sudo pkill -f node
    nohup npm start > frontend.log 2>&1 &

    echo "Full reset and update complete!"
}

function update_specific_files {
    echo "Updating specific files..."
    cd "$REPO_DIR" || exit 1
    git fetch "$REMOTE"

    for file in "$@"; do
    # Prepend src/ if the file is in the frontend directory and no path is provided
    [[ "$file" != */* ]] && file="src/$file"
    echo "Pulling: $file"
    git checkout "$REMOTE/$BRANCH" -- "$file"
done


    echo "Files updated. You may need to restart affected services manually."
}

# Main flag parser
case "$1" in
    -a)
        full_update
        ;;
    -i)
        shift
        if [ $# -eq 0 ]; then
            echo "No files specified for -i flag."
            exit 1
        fi
        update_specific_files "$@"
        ;;
    *)
        echo "Usage:"
        echo "  ./update.sh -a                    # Full reset and restart"
        echo "  ./update.sh -i <file1> <file2>    # Update only specific files"
        exit 1
        ;;
esac
