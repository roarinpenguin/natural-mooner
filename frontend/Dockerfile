# Build Stage
FROM node:20-slim as build

WORKDIR /app
ENV CI=true

# Copy package.json
COPY package*.json ./

# Install dependencies with default HTTPS registry
RUN npm install --no-audit --no-fund --no-update-notifier

COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
