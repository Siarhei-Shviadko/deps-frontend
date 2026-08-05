ARG REPOSITORY_URL=""
FROM ${REPOSITORY_URL:+$REPOSITORY_URL/base/}node:20.19.4-alpine3.21 as build_node

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --silent --non-interactive

ADD ./config ./config
ADD ./public ./public
ADD ./scripts ./scripts
ADD ./src ./src
ADD ./vendors ./vendors
ADD ./webpack ./webpack
ADD ./.browserslistrc ./.browserslistrc
ADD ./jsconfig.json ./jsconfig.json

ARG ENABLE_SOURCE_MAP=

ENV ENABLE_SOURCE_MAP=$ENABLE_SOURCE_MAP

RUN yarn build

FROM ${REPOSITORY_URL:+$REPOSITORY_URL/base/}nginx:1.28.0

WORKDIR /app

RUN apt update -y && apt upgrade -y
RUN apt install -y dumb-init

WORKDIR /app

ADD ./scripts/runtime-env.sh ./scripts/
ADD ./.env.example .

COPY --from=build_node /app/dist ./dist

RUN rm /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./docker/docker-entrypoint.sh .

RUN chmod +x ./docker-entrypoint.sh

RUN chgrp -R root /var/cache/nginx /var/log/nginx /etc/nginx && \
    chgrp root /var/run && \
    chmod -R 777 /var/cache/nginx /var/log/nginx /app/dist && \
    chmod 777 /var/run

RUN cp -a ./dist/. /usr/share/nginx/html

EXPOSE 8000

RUN useradd -Ms /bin/bash deps
USER deps

ARG BUILD_HASH=
ARG BUILD_TAG=
ARG BUILD_DATE=

ENV SERVICE_INFO_HASH=$BUILD_HASH
ENV SERVICE_INFO_TAG=$BUILD_TAG
ENV SERVICE_INFO_DATE=$BUILD_DATE

CMD ["/usr/bin/dumb-init", "--", "./docker-entrypoint.sh"]
