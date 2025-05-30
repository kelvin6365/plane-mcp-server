# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (ignore scripts to avoid running unnecessary lifecycle scripts)
RUN npm install --ignore-scripts

# Copy the rest of the files
COPY . .

# Build the project
RUN npm run build

# Expose port if necessary (not strictly needed for stdio based MCP)

# Set the command to run the server
CMD ["node", "dist/index.js"]
