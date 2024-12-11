FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .
# nicht technisch notwendig , Doku 
EXPOSE 3000

CMD ["npm", "start"]