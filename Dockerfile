FROM node:lts-alpine AS dev

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "run", "serve"]

FROM node:lts-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

USER node

CMD ["node", "src/api/v1/index.js"]
