FROM node:8

WORKDIR /opt/opencdn/devmgmtV2

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

#RUN ls /opt/opencdn

CMD node ./index.js


