FROM node:23-slim

WORKDIR /app

# Install Bun
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Copy package files
COPY package.json ./
COPY bun.lockb ./

# Create empty .husky directory to prevent chmod errors
RUN mkdir -p .husky/_

# Install dependencies using Bun - with Husky disabled
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1
ENV CI=true
ENV DISABLE_HUSKY=true

# Setup a custom install that avoids husky errors
RUN bun install || (mkdir -p .husky && touch .husky/pre-commit && chmod +x .husky/pre-commit && bun install)

# Copy the rest of the application
COPY . .

# Start the application with Bun
CMD ["bun", "run", "start"]
