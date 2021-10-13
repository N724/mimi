FROM node
COPY ./ /mimi
RUN npm install pm2 -g && cd /mimi && npm i
CMD ["pm2", " start /mini/app.js"]