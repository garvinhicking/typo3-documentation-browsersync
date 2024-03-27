# syntax=docker/dockerfile:1
ARG NODE_VERSION=20
ARG NODE_PORT=5173
ARG MAIN_WORKDIR=/project

FROM ghcr.io/typo3-documentation/render-guides:0.2.34 as Renderguides
WORKDIR ${MAIN_WORKDIR}

FROM node:${NODE_VERSION}-alpine
ARG NODE_VERSION
ARG NODE_PORT
ARG MAIN_WORKDIR

COPY --from=Renderguides /opt/guides /opt/guides

# Use production node environment by default.
ENV NODE_ENV production
WORKDIR ${MAIN_WORKDIR}

RUN apk add php82-cli php82-phar php82-dom php82-fileinfo php82-iconv php82-mbstring php82-tokenizer php82-xml php82-xmlwriter php82-openssl --no-cache

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --verbose --omit=dev

# Run the application as a non-root user.
# USER node

# Copy the rest of the source files into the image.
COPY . ${MAIN_WORKDIR}

# Expose the port that the application listens on.
EXPOSE ${NODE_PORT}


# Run the application.
ENTRYPOINT [ "/project/entrypoint.sh" ]
#CMD npm run dev

