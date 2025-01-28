#!/usr/bin/env bash

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}FilesFly Installation Check${NC}"

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: Bun is required but not installed!${NC}"
    echo -e "${YELLOW}Please install Bun first:${NC}"
    echo -e "  curl -fsSL https://bun.sh/install | bash"
    echo -e "${YELLOW}After installing Bun, run this install script again.${NC}"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is required but not installed!${NC}"
    echo -e "${YELLOW}Please install Git before proceeding.${NC}"
    exit 1
fi

# Create necessary directories
CONFIG_DIR="$HOME/.config/filesfly"
INSTALL_DIR="$HOME/.local/lib/filesfly"
mkdir -p "$CONFIG_DIR"
mkdir -p "$INSTALL_DIR"
mkdir -p "$HOME/.local/bin"

# Check if already installed and clean up if necessary
if [ -d "$INSTALL_DIR/.git" ]; then
    echo -e "${BLUE}Existing installation found. Updating...${NC}"
    # Unlink the current binary
    bun unlink filesfly 2>/dev/null || true
    # Clean the install directory but preserve .git for faster updates
    find "$INSTALL_DIR" -mindepth 1 -not -path '*/.git*' -delete
else
    echo -e "${BLUE}Fresh installation...${NC}"
    rm -rf "$INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
fi

# Clone/update repository
if [ -d "$INSTALL_DIR/.git" ]; then
    echo -e "${BLUE}Pulling latest changes...${NC}"
    cd "$INSTALL_DIR"
    git fetch origin
    git reset --hard origin/master
else
    echo -e "${BLUE}Cloning FilesFly repository...${NC}"
    git clone https://github.com/ralf-boltshauser/filesfly.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Make source binary executable
chmod +x bin/ff.ts

# Install dependencies and link globally
echo -e "${BLUE}Installing dependencies...${NC}"
bun install
bun link

# Determine shell and config file
PATH_UPDATES="# Add Bun and local binaries to PATH
export PATH=\"\$HOME/.local/bin:\$HOME/.bun/bin:\$PATH\""

SHELL_NAME=$(basename "$SHELL")
SHELL_CONFIG=""

case "$SHELL_NAME" in
    "zsh")
        if [ -f "$HOME/.zshrc" ]; then
            SHELL_CONFIG="$HOME/.zshrc"
        fi
        ;;
    "bash")
        # Try common bash config files in order
        for conf in "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
            if [ -f "$conf" ]; then
                SHELL_CONFIG="$conf"
                break
            fi
        done
        ;;
    *)
        # For other shells, try to find a suitable config
        for conf in "$HOME/.profile" "$HOME/.${SHELL_NAME}rc"; do
            if [ -f "$conf" ]; then
                SHELL_CONFIG="$conf"
                break
            fi
        done
        ;;
esac

# If no config file found, create .profile
if [ -z "$SHELL_CONFIG" ]; then
    SHELL_CONFIG="$HOME/.profile"
    echo -e "${YELLOW}No shell config file found. Creating $SHELL_CONFIG${NC}"
    touch "$SHELL_CONFIG"
fi

# Add PATH updates if not already present
if ! grep -q "Add Bun and local binaries to PATH" "$SHELL_CONFIG" 2>/dev/null; then
    echo -e "\n$PATH_UPDATES" >> "$SHELL_CONFIG"
    echo -e "${BLUE}Added PATH updates to $SHELL_CONFIG${NC}"
fi

# Export PATH immediately for this session
export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"

echo -e "${GREEN}FilesFly installed successfully!${NC}"
echo -e "\nTo configure FilesFly, create a config file at: ${BLUE}~/.config/filesfly/filesfly.json${NC}"
echo -e "Example configuration:"
echo -e '{
  "ENDPOINT": "your-endpoint",
  "ACCESS_KEY_ID": "your-access-key",
  "SECRET_ACCESS_KEY": "your-secret",
  "BUCKET": "your-bucket",
  "REGION": "your-region"
}'

echo -e "\n${YELLOW}To start using FilesFly, either:${NC}"
echo -e "1. Restart your terminal, or"
echo -e "2. Run this command: ${BLUE}source $SHELL_CONFIG${NC}" 