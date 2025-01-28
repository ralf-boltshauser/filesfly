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

# Create config directory
CONFIG_DIR="$HOME/.config/filesfly"
mkdir -p "$CONFIG_DIR"

# Create a temporary directory for installation
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Clone the repository
echo -e "${BLUE}Cloning FilesFly repository...${NC}"
git clone https://github.com/ralf-boltshauser/filesfly.git
cd filesfly

# Install dependencies and link globally
echo -e "${BLUE}Installing dependencies...${NC}"
bun install
bun link

# Clean up
cd
rm -rf "$TEMP_DIR"

# Check if installation was successful
if command -v ff &> /dev/null; then
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
else
    echo -e "${RED}Installation failed. Please try again or install manually.${NC}"
    exit 1
fi 