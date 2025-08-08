# Stage 1: Build the Angular application
FROM node:18-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
# The project name is 'terminal-maps' based on your README
RUN npm run build -- --configuration production

# Stage 2: Serve the application from Nginx
FROM nginx:alpine
# Install gettext for the envsubst command
RUN apk --update --no-cache add gettext

# Copy the built app from the 'build' stage
COPY --from=build /usr/src/app/dist/terminal-maps /usr/share/nginx/html
# Copy our nginx config as a template
COPY nginx.conf /etc/nginx/templates/default.conf.template
# On container startup, substitute the PORT environment variable and start nginx
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]