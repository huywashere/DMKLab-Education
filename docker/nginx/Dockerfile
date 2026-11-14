FROM nginx:1.27-alpine

# Install openssl for auto-fallback certificate generation and gettext for envsubst
RUN apk add --no-cache openssl gettext

# Remove default configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy reverse proxy configuration template & fallback config
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY entrypoint.sh /docker-entrypoint.d/40-ssl-fallback.sh
RUN chmod +x /docker-entrypoint.d/40-ssl-fallback.sh

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
