# Stage 1: Build Front-End
FROM node:20-alpine AS build-ui
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Compile Backend TypeScript
FROM node:20-alpine AS build-server
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY server.ts ./
RUN npm run build

# Stage 3: Run Compiled Server & Serve Static Assets
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build-ui /app/client/dist ./public
COPY --from=build-server /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/server.js"]