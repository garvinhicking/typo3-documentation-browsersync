# syntax=docker/dockerfile:1
ARG NODE_VERSION=20
ARG NODE_PORT=5173
ARG MAIN_WORKDIR=/project

FROM composer:2 as Builder

WORKDIR /opt/guides
COPY composer.* /opt/guides

RUN composer install --no-interaction --no-progress  \
    --optimize-autoloader --classmap-authoritative


FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

RUN apk add php82-cli php82-phar php82-dom php82-fileinfo --no-cache

WORKDIR ${MAIN_WORKDIR}

COPY --from=Builder /opt/guides /opt/guides

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user.
# USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE ${NODE_PORT}

# Run the application.
CMD npm run dev
