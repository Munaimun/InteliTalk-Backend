FROM node:22.21.1-alpine3.21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --force

COPY . .

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["npm", "start"]