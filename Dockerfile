FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@8

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
