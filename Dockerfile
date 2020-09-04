FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN npm install
EXPOSE 29001
CMD [ "ifconfig" ]
CMD [ "npm", "install" ]
CMD [ "npm", "rebuild" ]
CMD [ "npm", "start" ]
