FROM node:10-alpine

COPY ./package-lock.json ./package.json ./
RUN npm i
COPY . ./
RUN npm run build

ENTRYPOINT ["node", "lib/index.js"]
