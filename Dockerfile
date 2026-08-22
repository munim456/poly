FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json

COPY client/ client/
COPY server/ server/

RUN cd client && (npm ci || npm install)
RUN cd server && (npm ci --omit=dev || npm install --omit=dev)
RUN cd client && npm run build

ENV NODE_ENV=production

EXPOSE 10000

CMD ["node", "server/src/index.js"]
