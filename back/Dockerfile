FROM php:8.3-fpm-alpine


# 1. Системные зависимости
RUN apk add --no-cache \
    git \
    curl \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    postgresql-dev \
    nodejs \
    npm \
    bash \
    shadow \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev

# 2. PHP расширения
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure zip \
    && docker-php-ext-install \
        intl \
        mbstring \
        pdo \
        pdo_pgsql \
        xml \
        pcntl \
        gd \
        bcmath \
        zip

RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS


# 3. Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 4. Пользователь
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data

WORKDIR /var/www/html

# 5. Копируем только composer-файлы для кеша
COPY composer.json composer.lock ./

RUN composer install --no-scripts --no-autoloader

# 6. Копируем остальной код
COPY . .

# 7. Autoload
RUN composer dump-autoload

# 8. Node-зависимости для Filament/Vite ассетов (если нужно)
# (опционально, можно убрать, если вообще не используешь front в Laravel)
RUN if [ -f package.json ]; then npm install; fi

# 9. Права
RUN chown -R www-data:www-data storage bootstrap/cache

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
