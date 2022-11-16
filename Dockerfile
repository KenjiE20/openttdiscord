FROM node:19-alpine

WORKDIR /home/openttdiscord

ADD ./ ./

RUN npm install

CMD [ "node", "index.js" ]