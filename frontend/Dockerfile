## Multi Stage Build
FROM node AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .
# Pass environment variables during the build process
ARG REACT_APP_USER_POOL_ID
ARG REACT_APP_CLIENT_ID
ARG REACT_APP_USER_POOL_ID_FREELANCER
ARG REACT_APP_CLIENT_ID_FREELANCER
RUN npm run build

FROM nginx

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80