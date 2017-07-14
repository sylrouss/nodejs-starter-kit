FROM node:6.10.1

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json /usr/app/
RUN npm install --production

COPY dist /usr/app/dist
COPY config /usr/app/config

CMD ["npm", "run", "-s", "start"]
