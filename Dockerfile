FROM node:alpine-lts AS builder

WORKDIR /build

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --force

COPY . .

RUN npm run build

FROM node:alpine-lts AS runner

WORKDIR /app

COPY --from=builder /build/node_modules .
COPY --from=builder /build/package.json .
COPY --from=builder /build/package-lock.json .

CMD ["npm", "start"]
