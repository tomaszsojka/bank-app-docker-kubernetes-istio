FROM node:latest

WORKDIR /src

COPY src/ ./

RUN npm install

EXPOSE 8080
CMD [ "node", "server.js" ]