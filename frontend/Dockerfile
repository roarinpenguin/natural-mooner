# Build Stage
FROM node:20-slim as build

WORKDIR /app
ENV CI=true

# Copy package.json
COPY package*.json ./

# Switch back to NPM with robust network settings
# 1. Use HTTP registry to avoid SSL handshake hangs
# 2. Disable strict SSL
# 3. Increase timeout significantly
# 4. Disable audit and fund checks for speed
RUN npm config set registry http://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --no-audit --no-fund --no-update-notifier

COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
