FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

USER node

CMD ["node", "src/api/v1/index.js"]
