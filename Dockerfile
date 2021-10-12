FROM node
COPY ./ /mimi
RUN npm install pm2 -g && cd /mimi && npm i
CMD [ "cd /mimi","pm2-runtime", "npm", "--", "start" ]