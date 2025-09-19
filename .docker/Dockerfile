FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 8443

ENV NODE_ENV=production

USER node

CMD ["npm", "run", "start"]
