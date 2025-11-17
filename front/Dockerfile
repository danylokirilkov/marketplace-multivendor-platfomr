FROM node:22-bullseye

WORKDIR /app

ENV ROLLUP_SKIP_NODEJS_NATIVE=true
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install --include=dev

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
