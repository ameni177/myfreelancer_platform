FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .
# nicht technisch notwendig , Doku 
EXPOSE 3001

CMD ["npx", "nodemon", "--watch", "legacy", "server.js"]
