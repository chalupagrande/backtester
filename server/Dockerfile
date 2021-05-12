# pull official base image
FROM node:16-alpine3.11

# set working directory
 WORKDIR /app

# install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# add app
COPY . ./

# start app
CMD ["yarn", "start"]

