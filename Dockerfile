FROM node:19-alpine

WORKDIR /home/openttdiscord

COPY ./openttdiscord ./

RUN npm install

CMD [ "node", "index.js" ]