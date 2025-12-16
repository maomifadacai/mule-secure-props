# 快速开始指南

## 前置条件

1. **安装Node.js** (>= 14.0.0)
   - 下载地址: https://nodejs.org/

2. **安装Java运行时**
   - JDK 1.8
   - JDK 11  
   - JDK 17
   - 确保Java已添加到系统PATH，或配置环境变量

3. **获取MuleSoft JAR文件**
   - `mule-secure-props-java8-11.jar` (Java 8和11共用)
   - `mule-secure-props-java17.jar` (Java 17专用)

## 本地开发

### 1. 准备JAR文件

将MuleSoft提供的JAR文件复制到 `backend/jars/` 目录：

```bash
backend/jars/
├── mule-secure-props-java8-11.jar
└── mule-secure-props-java17.jar
```

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 配置后端环境变量（可选）

复制 `.env.example` 为 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

如果你的Java不在系统PATH中，需要设置：

```env
JAVA_HOME_8=C:\Program Files\Java\jdk1.8.0_xxx
JAVA_HOME_11=C:\Program Files\Java\jdk-11.0.x
JAVA_HOME_17=C:\Program Files\Java\jdk-17.0.x
```

### 4. 启动后端服务

```bash
# 开发模式（自动重启）
npm run dev

# 或生产模式
npm start
```

后端将在 `http://localhost:8080` 启动

### 5. 安装前端依赖

打开新的终端窗口：

```bash
cd frontend
npm install
```

### 6. 启动前端服务

```bash
npm run dev
```

前端将在 `http://localhost:3000` 启动

## 使用Docker（推荐生产环境）

### 1. 准备JAR文件

确保JAR文件在 `backend/jars/` 目录中

### 2. 启动服务

```bash
docker-compose up -d
```

### 3. 访问应用

- 前端: http://localhost
- 后端API: http://localhost:8080

### 4. 停止服务

```bash
docker-compose down
```

## 验证安装

### 检查后端服务

```bash
curl http://localhost:8080/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "...",
  "supportedVersions": ["1.8", "11", "17"]
}
```

### 测试加密API

```bash
curl -X POST http://localhost:8080/api/v1/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "plainText": "test",
    "javaVersion": "17",
    "masterPassword": "mypassword"
  }'
```

## 常见问题

### 1. JAR文件找不到

错误信息：`JAR file not found`

**解决方案**: 
- 确保JAR文件在 `backend/jars/` 目录中
- 检查文件名是否匹配配置（`mule-secure-props-java8-11.jar` 和 `mule-secure-props-java17.jar`）
- 如果文件名不同，需要修改 `backend/src/config/javaConfig.js`

### 2. Java进程无法启动

错误信息：`无法启动Java进程`

**解决方案**:
- 确保Java已正确安装
- 检查环境变量 `JAVA_HOME_8`, `JAVA_HOME_11`, `JAVA_HOME_17` 是否正确
- 或确保Java在系统PATH中

### 3. 端口被占用

**解决方案**:
- 修改 `backend/.env` 中的 `PORT` 变量
- 或修改 `frontend/vite.config.js` 中的代理配置

### 4. CORS错误（前端无法访问后端）

**解决方案**:
- 确保后端服务正在运行
- 检查 `frontend/vite.config.js` 中的代理配置
- 开发环境中前端通过Vite代理访问后端，无需担心CORS

## 下一步

- 查看 [README.md](README.md) 了解完整文档
- 查看 [MULE_SECURE_PROPS_WEB_GUIDE.md](MULE_SECURE_PROPS_WEB_GUIDE.md) 了解详细的技术指南

