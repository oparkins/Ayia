###
#FROM node:21.6.1-bookworm-slim
FROM node:21.6.1-alpine3.19 AS builder

ADD --chown=node:node \
      package.json Makefile     /app/

ADD --chown=node:node etc/      /app/etc/
ADD --chown=node:node lib/      /app/lib/
ADD --chown=node:node tests/    /app/tests/
ADD --chown=node:node versions/ /app/versions/

WORKDIR /app

RUN npm install && \
    chown -R node:node .

###
FROM node:21.6.1-alpine3.19
MAINTAINER D. Elmo Peele

RUN apk add --no-cache bash make vim
ADD sys/user.sh   /etc/bash/

USER node
WORKDIR /app

COPY --from=builder /app /app
ADD sys/.bashrc     /home/node/

# Expose:
#   - the configuration volume (etc/config.yaml)
#   - the cache volume
VOLUME [ "/app/etc", "/app/cache" ]

CMD [ "npx", "nodemon", "--", "./bin/web-admin", "-c", "./etc/config.yaml" ]
