FROM node
COPY ./ /mimi
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo ‘Asia/Shanghai’ >/etc/timezone
RUN npm install pm2 -g && cd /mimi && npm i
CMD ["pm2-runtime", "/mimi/app.js"]