FROM node:carbon

WORKDIR /usr/cadence-web

ENV NODE_ENV=production

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

ENV CADENCE_WEB_ROOT=/admin/cadence
# Bundle the client code
RUN npm run build-production

EXPOSE 8088
CMD [ "node", "server.js" ]