FROM node:22-bookworm-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y --no-install-recommends \
		ca-certificates \
		libgomp1 \
		libstdc++6 \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install --force

COPY . .

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["npm", "start"]
