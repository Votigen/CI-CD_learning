FROM node:18-alpine

WORKDIR /app

# 复制 package 文件并安装依赖
COPY package*.json ./
RUN npm install

# 复制所有后端源代码
COPY . .

# 暴露 Express 端口
EXPOSE 5000

# 启动 Express 应用
CMD ["node", "src/config/server.js"]