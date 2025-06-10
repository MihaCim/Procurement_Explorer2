# Use a lightweight Node image for building the application
FROM node:22-alpine3.19 AS builder

# Set the working directory for the build stage
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to install dependencies
COPY yarn.lock package.json ./

# Install dependencies using Yarn
RUN yarn install

# Copy all source files to the container
COPY . .

# Build the application for production
RUN yarn build

# Use a lightweight server to serve the static files
FROM nginx:alpine

ARG VITE_API_BASE_URL
ARG VITE_API_PORT

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_PORT=$VITE_API_PORT

# Copy the built files from the builder stage to the NGINX HTML directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom NGINX template configuration
COPY ./nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

RUN envsubst '${VITE_API_BASE_URL} ${VITE_API_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Add a script to render the NGINX configuration template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the port that NGINX will run on
EXPOSE 3399

# Start NGINX when the container starts
CMD ["/entrypoint.sh"]

