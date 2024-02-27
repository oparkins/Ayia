###
#FROM node:21.6.1-bookworm-slim
FROM node:21.6.1-alpine3.19 AS builder

ADD --chown=node:node ./  /app

WORKDIR /app

RUN npm install && \
    npm run build && \
    chown -R node:node .

###
FROM node:21.6.1-alpine3.19
MAINTAINER D. Elmo Peele

COPY --from=builder /app /app
RUN chown -R node:node /app

USER node
WORKDIR /app

# Expose the configuration volume (etc/config.yaml)
VOLUME [ "/app/etc" ]

CMD [ "npx", "nodemon", "--", "./web-ui", "-c", "./etc/config.yaml" ]
