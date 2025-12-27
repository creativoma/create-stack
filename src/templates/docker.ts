/**
 * Docker configuration templates
 */

export const dockerfile = `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
`;

export const dockerignore = `node_modules
.git
.env*
Dockerfile
.dockerignore
*.db
`;

export const gitignore = `node_modules
dist
.env
.env.local
.DS_Store
*.log
.vscode/*
!.vscode/extensions.json
*.db
`;

export const envTemplate = '# Environment Variables\nDATABASE_URL="file:./dev.db"\n';

export const envLocalTemplate = '# Local Environment Variables\n';

export const envExampleTemplate =
  '# Example Environment Variables\n# Copy this to .env.local\nDATABASE_URL="file:./dev.db"\n';
