FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY app.conf /etc/nginx/conf.d/app.conf

WORKDIR /var/www/html
