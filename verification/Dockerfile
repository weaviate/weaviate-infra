FROM node:10-alpine

COPY ./package-lock.json ./package.json ./
RUN npm i
COPY . ./
RUN npm run build

ENTRYPOINT ["node", "lib/index.js"]
CMD ["generate", "-t", "10", "-r", "10", "-a", "10", "-v", "10", "-c", "10", "--debug", "-w", "http://weaviate:80"]