FROM node:current-slim

WORKDIR /app

# Tools for building native modules (e.g., bcrypt, mysql2)
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install dependencies (dev deps are needed for Rollup)
RUN npm ci

COPY . .

# Build the project (Rollup)
RUN npm run build

# Remove dev dependencies and build tools
RUN npm prune --omit=dev \
 && apt-get purge -y --auto-remove python3 build-essential \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 8443

ENV NODE_ENV=production

USER node

CMD ["npm", "run", "start"]