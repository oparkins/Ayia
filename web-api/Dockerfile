###
#FROM node:21.6.1-bookworm-slim
FROM node:21.6.1-alpine3.19 AS builder

ADD --chown=node:node \
      package.json            /app/

ADD --chown=node:node api/    /app/api/
ADD --chown=node:node bin/    /app/bin/
ADD --chown=node:node etc/    /app/etc/
ADD --chown=node:node lib/    /app/lib/

WORKDIR /app

RUN npm install && \
    chown -R node:node .

###
FROM node:21.6.1-alpine3.19
MAINTAINER D. Elmo Peele

USER node
WORKDIR /app

COPY --from=builder /app /app

# Expose the configuration volume (etc/config.yaml)
VOLUME [ "/app/etc" ]

CMD [ "npx", "nodemon", "--", "./bin/web-api", "-c", "./etc/config.yaml" ]
