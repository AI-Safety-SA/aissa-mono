#!/bin/bash
# Setup script for git worktrees
# This script should be run from within a worktree to set it up

set -e

# Get the root worktree path (the main repository)
# The first entry in `git worktree list` is always the main worktree
get_root_worktree() {
    local root_path=$(git worktree list --porcelain | head -1 | sed 's/^worktree //')

    if [[ -n "$root_path" && -d "$root_path" ]]; then
        echo "$root_path"
        return 0
    fi

    echo "Error: Could not determine root worktree path" >&2
    return 1
}

ROOT_WORKTREE_PATH=$(get_root_worktree)
export ROOT_WORKTREE_PATH

echo "Root worktree: $ROOT_WORKTREE_PATH"
echo "Current directory: $(pwd)"

# Check if we're in the root worktree (skip setup if so)
if [[ "$(pwd)" == "$ROOT_WORKTREE_PATH" ]]; then
    echo "Already in root worktree, skipping setup"
    exit 0
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Copy environment files from root worktree
if [[ -f "$ROOT_WORKTREE_PATH/apps/track-record/.env" ]]; then
    echo "Copying track-record .env file..."
    cp "$ROOT_WORKTREE_PATH/apps/track-record/.env" apps/track-record/.env
else
    echo "Warning: No .env file found at $ROOT_WORKTREE_PATH/apps/track-record/.env"
fi

# Copy other env files if they exist
if [[ -f "$ROOT_WORKTREE_PATH/apps/desk-booking/.env.local" ]]; then
    echo "Copying desk-booking .env.local file..."
    cp "$ROOT_WORKTREE_PATH/apps/desk-booking/.env.local" apps/desk-booking/.env.local
fi

if [[ -f "$ROOT_WORKTREE_PATH/apps/website/.env" ]]; then
    echo "Copying website .env file..."
    cp "$ROOT_WORKTREE_PATH/apps/website/.env" apps/website/.env
fi

# Build dependencies
echo "Building track-record dependencies..."
pnpm build:ui

echo "Worktree setup complete!"
