FROM node

WORKDIR /usr/app/test

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3333

CMD [ "nmp", "run", "dev" ]