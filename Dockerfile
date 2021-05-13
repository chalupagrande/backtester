FROM node:16.1.0
WORKDIR /backtester
ENV PORT 80

COPY package.json /backtester/package.json
COPY packages /backtester/packages

RUN yarn install

CMD ["yarn", "start"]