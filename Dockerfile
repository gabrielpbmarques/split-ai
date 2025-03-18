FROM node:22-slim

WORKDIR /app

# Install Bun
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Copy package files
COPY package.json ./
COPY bun.lockb ./

# Install dependencies using Bun (disable husky for Docker builds)
RUN HUSKY=0 bun install

# Copy the rest of the application
COPY . .

# Start the application with Bun
CMD ["bun", "run", "start"]
