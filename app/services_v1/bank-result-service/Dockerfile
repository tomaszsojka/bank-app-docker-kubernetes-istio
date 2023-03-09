FROM node:latest

WORKDIR /src

COPY src/ ./


RUN npm install
EXPOSE 8085

CMD [ "node", "server.js" ]