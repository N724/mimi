FROM node
COPY ./ /mimi
RUN npm install pm2 -g && cd /mimi && npm i
CMD ["pm2-runtime", "/mini/app.js" ]