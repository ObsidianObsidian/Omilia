FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g ts-node && npm i typescript --save-dev
COPY tsconfig.json .
COPY src src

CMD ["npm", "start"]