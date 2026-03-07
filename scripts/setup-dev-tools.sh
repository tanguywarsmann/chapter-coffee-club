#!/bin/bash
# Setup script for development tools
# Installs: Vercel CLI, EAS CLI
# Requires: Node.js >= 20, npm >= 10

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Checking Node.js / npm...${NC}"
node --version || { echo "Node.js is required (>= 20)"; exit 1; }
npm --version

# Install pnpm if missing
if ! command -v pnpm &>/dev/null; then
  echo -e "${YELLOW}Installing pnpm...${NC}"
  npm install -g pnpm
fi
echo -e "${GREEN}pnpm $(pnpm --version) OK${NC}"

# Install Vercel CLI
echo -e "${YELLOW}Installing Vercel CLI...${NC}"
npm install -g vercel
echo -e "${GREEN}Vercel CLI $(vercel --version) OK${NC}"

# Install EAS CLI
echo -e "${YELLOW}Installing EAS CLI...${NC}"
npm install -g eas-cli
echo -e "${GREEN}EAS CLI $(eas --version) OK${NC}"

# Add to ~/.zshrc if not already present
ZSHRC="$HOME/.zshrc"
NODE_BIN_PATH=$(dirname "$(which npm)")

if [ -f "$ZSHRC" ] && ! grep -q "NODE_PATH for vercel/eas" "$ZSHRC"; then
  echo "" >> "$ZSHRC"
  echo "# NODE_PATH for vercel/eas" >> "$ZSHRC"
  echo "export PATH=\"$NODE_BIN_PATH:\$PATH\"" >> "$ZSHRC"
  echo -e "${GREEN}Added $NODE_BIN_PATH to ~/.zshrc${NC}"
fi

echo ""
echo -e "${GREEN}All tools installed successfully!${NC}"
echo "  vercel  -> $(which vercel)"
echo "  eas     -> $(which eas)"
echo "  npm     -> $(npm --version)"
echo "  pnpm    -> $(pnpm --version)"
echo ""
echo "Run: source ~/.zshrc"
