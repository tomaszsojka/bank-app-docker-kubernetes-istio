FROM node:latest

WORKDIR /src

COPY src/ ./


RUN npm install

EXPOSE 8081
CMD [ "node", "server.js" ]