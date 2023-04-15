FROM node:16-alpine
# Env
ENV TIME_ZONE=Asia/Hong_Kong
ENV NODE_ENV production
# Set the timezone in docker
RUN apk --update add tzdata
RUN cp /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime
RUN echo "Asia/Hong_Kong" > /etc/timezone
RUN apk del tzdata
# Create Directory for the Container
WORKDIR /usr/src/app
# Only copy the package.json file to work directory
COPY package.json .
# Install all Packages
RUN npm install
# Copy all other source code to work directory
ADD . /usr/src/app
# TypeScript
RUN npm run build
# Start
CMD [ "npm", "run", "start:prod" ]
EXPOSE 8080