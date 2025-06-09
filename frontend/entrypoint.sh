#!/bin/sh

# Substitute environment variables in the Nginx configuration template
envsubst '${VITE_API_BASE_URL} ${VITE_API_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx
nginx -g 'daemon off;'
