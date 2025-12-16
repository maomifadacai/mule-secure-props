# Mule Secure Properties 在线加解密工具

一个基于Web的Mule Secure Properties加解密工具，支持Java 8、11、17三个版本。

## 功能特性

### 核心功能
- ✅ **基础加解密**: 单个值的加密和解密
- ✅ **多Java版本支持**: 支持JDK 1.8、Java 11、Java 17
- ✅ **批量处理**: 批量加密和解密多个属性
- ✅ **文件处理**: 支持上传properties文件进行批量处理
- ✅ **密钥生成器**: 生成安全的随机密钥和密码
- ✅ **历史记录**: 记录操作历史（可选功能）

## 技术栈

### 后端
- Node.js + Express
- 通过子进程调用MuleSoft提供的JAR文件

### 前端
- React 18
- Material-UI (MUI)
- Vite

## 快速开始

### 前置要求

1. **Node.js** >= 14.0.0
2. **Java运行时环境**:
   - JDK 1.8
   - JDK 11
   - JDK 17
3. **MuleSoft JAR文件**:
   - `mule-secure-props-java8-11.jar` (Java 8和11共用)
   - `mule-secure-props-java17.jar` (Java 17专用)

### 安装步骤

#### 1. 准备JAR文件

将MuleSoft提供的JAR文件复制到 `backend/jars/` 目录：

```bash
backend/jars/
├── mule-secure-props-java8-11.jar
└── mule-secure-props-java17.jar
```

#### 2. 配置后端

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件，配置Java路径（如果需要）
```

#### 3. 启动后端服务

```bash
npm start
# 或开发模式
npm run dev
```

后端服务将在 `http://localhost:8080` 启动。

#### 4. 配置前端

```bash
cd frontend
npm install
```

#### 5. 启动前端服务

```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

## 使用Docker部署

### 使用Docker Compose（推荐）

1. 确保JAR文件已放置在 `backend/jars/` 目录
2. 运行：

```bash
docker-compose up -d
```

服务将在以下地址可用：
- 前端: http://localhost
- 后端API: http://localhost:8080

### 单独构建Docker镜像

#### 后端

```bash
cd backend
docker build -t mule-secure-props-backend .
docker run -p 8080:8080 \
  -v $(pwd)/jars:/app/jars:ro \
  -e JAVA_HOME_8=/usr/lib/jvm/java-8-openjdk-amd64 \
  -e JAVA_HOME_11=/usr/lib/jvm/java-11-openjdk-amd64 \
  -e JAVA_HOME_17=/usr/lib/jvm/java-17-openjdk-amd64 \
  mule-secure-props-backend
```

#### 前端

```bash
cd frontend
docker build -t mule-secure-props-frontend .
docker run -p 80:80 mule-secure-props-frontend
```

## API文档

### 基础API

#### 加密
```http
POST /api/v1/encrypt
Content-Type: application/json

{
  "plainText": "your_secret_value",
  "javaVersion": "1.8|11|17",
  "masterPassword": "your_master_password"
}
```

#### 解密
```http
POST /api/v1/decrypt
Content-Type: application/json

{
  "encryptedValue": "![AES:encrypted_value]",
  "javaVersion": "1.8|11|17",
  "masterPassword": "your_master_password"
}
```

### 批量API

#### 批量加密
```http
POST /api/v1/batch/encrypt
Content-Type: application/json

{
  "properties": [
    { "key": "key1", "value": "value1" },
    { "key": "key2", "value": "value2" }
  ],
  "javaVersion": "1.8",
  "masterPassword": "master_password"
}
```

#### 批量解密
```http
POST /api/v1/batch/decrypt
Content-Type: application/json

{
  "properties": [
    { "key": "key1", "encrypted": "![AES:...]" }
  ],
  "javaVersion": "1.8",
  "masterPassword": "master_password"
}
```

### 文件API

#### 文件加密
```http
POST /api/v1/file/encrypt
Content-Type: multipart/form-data

file: <properties文件>
masterPassword: <主密码>
javaVersion: 1.8|11|17
```

#### 文件解密
```http
POST /api/v1/file/decrypt
Content-Type: multipart/form-data

file: <properties文件>
masterPassword: <主密码>
javaVersion: 1.8|11|17
```

### 其他API

#### 生成密钥
```http
POST /api/v1/key/generate
Content-Type: application/json

{
  "type": "password|hex|base64|uuid",
  "length": 16,
  "options": {
    "includeUppercase": true,
    "includeLowercase": true,
    "includeNumbers": true,
    "includeSymbols": true
  }
}
```

#### 获取历史记录
```http
GET /api/v1/history?limit=50
```

#### 清除历史记录
```http
DELETE /api/v1/history
```

## 环境变量配置

### 后端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | 8080 |
| `JAVA_HOME_8` | JDK 1.8路径 | - |
| `JAVA_HOME_11` | JDK 11路径 | - |
| `JAVA_HOME_17` | JDK 17路径 | - |
| `ENABLE_HISTORY` | 启用历史记录 | false |
| `HISTORY_MAX_ENTRIES` | 最大历史记录数 | 100 |

## 注意事项

1. **JAR文件**: 
   - MuleSoft只提供2个JAR文件
   - Java 8和11共用同一个JAR文件
   - Java 17使用独立的JAR文件
   - 虽然Java 8和11共用JAR，但必须使用各自对应版本的JDK运行

2. **安全性**:
   - 生产环境建议使用HTTPS
   - 主密码不应在日志中记录
   - 敏感数据不应存储在历史记录中

3. **性能**:
   - 批量处理会依次执行，对于大量数据可能需要较长时间
   - 建议在生产环境中实施API速率限制

## 开发

### 项目结构

```
mule-secure-props/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── services/       # 业务服务
│   │   ├── controllers/    # 路由控制器
│   │   └── app.js          # 应用入口
│   ├── jars/               # JAR文件目录
│   ├── package.json
│   └── Dockerfile
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### 运行开发服务器

```bash
# 后端
cd backend
npm run dev

# 前端（新终端）
cd frontend
npm run dev
```

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！
