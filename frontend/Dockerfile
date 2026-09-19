FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Expose port and start command will be handled by docker-compose for dev
EXPOSE 3000
