FROM node:18-slim

# 安装多个Java版本
RUN apt-get update && apt-get install -y \
    openjdk-8-jdk-headless \
    openjdk-11-jdk-headless \
    openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制package文件并安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制应用代码
COPY src ./src

# 创建必要的目录
RUN mkdir -p jars uploads history

# 设置Java环境变量
ENV JAVA_HOME_8=/usr/lib/jvm/java-8-openjdk-amd64
ENV JAVA_HOME_11=/usr/lib/jvm/java-11-openjdk-amd64
ENV JAVA_HOME_17=/usr/lib/jvm/java-17-openjdk-amd64
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/app.js"]

