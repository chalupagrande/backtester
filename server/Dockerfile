# pull official base image
FROM node:16-alpine3.11
# set working directory
 WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
# COPY package-lock.json ./
COPY yarn.lock ./
# RUN npm install --silent
# RUN npm install react-scripts@3.4.1 -g --silent
# RUN npm install --global yarn
RUN yarn install
# add app
COPY . ./

# start app
CMD ["yarn", "start"]

