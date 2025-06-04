FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm install
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
