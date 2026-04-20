FROM node:20-alpine AS build
WORKDIR /app
# Vite inlines env vars at build time. Pass VITE_CLERK_PUBLISHABLE_KEY via
# `docker compose build --build-arg` or docker-compose.yml `args:`.
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
