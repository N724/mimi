FROM node
RUN npm install pm2 -g && npm i
CMD [ "pm2-runtime", "npm", "--", "start" ]