FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=production \
  PORT=3000 \
  HOST=0.0.0.0 \
  DATABASE_URL=postgres://user:password@localhost:5435/crud_db

CMD ["node", "src/index.js"]