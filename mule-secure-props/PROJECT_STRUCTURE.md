# 项目结构说明

## 目录结构

```
mule-secure-props/
├── backend/                          # 后端服务
│   ├── src/
│   │   ├── app.js                   # Express应用入口
│   │   ├── config/
│   │   │   └── javaConfig.js        # Java版本配置
│   │   ├── controllers/
│   │   │   └── securePropsController.js  # API路由控制器
│   │   └── services/
│   │       ├── jarService.js        # JAR调用服务（核心加解密）
│   │       ├── historyService.js    # 历史记录服务
│   │       ├── keyGenerator.js      # 密钥生成服务
│   │       └── fileService.js       # 文件处理服务
│   ├── jars/                        # MuleSoft JAR文件目录
│   │   ├── mule-secure-props-java8-11.jar
│   │   └── mule-secure-props-java17.jar
│   ├── uploads/                     # 文件上传临时目录
│   ├── history/                     # 历史记录存储目录
│   ├── package.json
│   ├── .env.example                 # 环境变量示例
│   ├── .gitignore
│   └── Dockerfile
│
├── frontend/                         # 前端应用
│   ├── src/
│   │   ├── App.jsx                  # 主应用组件
│   │   ├── main.jsx                 # React入口
│   │   ├── index.css                # 全局样式
│   │   ├── components/              # React组件
│   │   │   ├── BasicTool.jsx        # 基础加解密工具
│   │   │   ├── BatchTool.jsx        # 批量处理工具
│   │   │   ├── FileTool.jsx         # 文件处理工具
│   │   │   ├── KeyGenerator.jsx     # 密钥生成器
│   │   │   └── HistoryPanel.jsx     # 历史记录面板
│   │   └── services/
│   │       └── api.js               # API服务封装
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Vite配置
│   ├── nginx.conf                   # Nginx配置（生产环境）
│   ├── Dockerfile
│   └── .gitignore
│
├── docker-compose.yml               # Docker Compose配置
├── README.md                        # 项目说明文档
├── QUICKSTART.md                    # 快速开始指南
├── MULE_SECURE_PROPS_WEB_GUIDE.md  # 详细技术指南
└── .gitignore                       # Git忽略文件
```

## 核心功能模块

### 后端模块

1. **jarService.js** - 核心加解密服务
   - `encrypt()` - 单个加密
   - `decrypt()` - 单个解密
   - `batchEncrypt()` - 批量加密
   - `batchDecrypt()` - 批量解密
   - `executeJar()` - 执行JAR文件的通用方法

2. **securePropsController.js** - API路由
   - `/api/v1/encrypt` - 加密接口
   - `/api/v1/decrypt` - 解密接口
   - `/api/v1/batch/encrypt` - 批量加密
   - `/api/v1/batch/decrypt` - 批量解密
   - `/api/v1/file/encrypt` - 文件加密
   - `/api/v1/file/decrypt` - 文件解密
   - `/api/v1/key/generate` - 密钥生成
   - `/api/v1/history` - 历史记录

3. **historyService.js** - 历史记录服务（可选）
   - 保存操作历史
   - 查询历史记录
   - 清除历史记录

4. **keyGenerator.js** - 密钥生成
   - 生成随机密码
   - 生成十六进制密钥
   - 生成Base64密钥
   - 生成UUID

5. **fileService.js** - 文件处理
   - 解析Properties文件
   - 格式化Properties文件
   - 文件读写操作

### 前端组件

1. **BasicTool.jsx** - 基础加解密界面
   - 单个值加密/解密
   - Java版本选择
   - 结果展示

2. **BatchTool.jsx** - 批量处理界面
   - 批量加解密
   - Properties格式输入/输出
   - 处理结果表格展示

3. **FileTool.jsx** - 文件处理界面
   - 文件上传
   - 批量处理
   - 结果文件下载

4. **KeyGenerator.jsx** - 密钥生成器界面
   - 多种密钥类型
   - 参数配置
   - 一键复制

5. **HistoryPanel.jsx** - 历史记录界面
   - 历史记录列表
   - 清除历史
   - 操作状态展示

## API端点总结

### 基础功能
- `GET /api/v1/health` - 健康检查
- `GET /api/v1/versions` - 获取支持的Java版本
- `POST /api/v1/encrypt` - 加密
- `POST /api/v1/decrypt` - 解密

### 扩展功能
- `POST /api/v1/batch/encrypt` - 批量加密
- `POST /api/v1/batch/decrypt` - 批量解密
- `POST /api/v1/file/encrypt` - 文件加密
- `POST /api/v1/file/decrypt` - 文件解密
- `POST /api/v1/key/generate` - 生成密钥
- `GET /api/v1/history` - 获取历史记录
- `DELETE /api/v1/history` - 清除历史记录

## 数据流

### 加密流程
```
前端请求 → Express控制器 → jarService → Java子进程 → MuleSoft JAR → 返回加密结果 → 前端展示
```

### 解密流程
```
前端请求 → Express控制器 → jarService → Java子进程 → MuleSoft JAR → 返回解密结果 → 前端展示
```

## 配置要点

1. **Java配置** (`backend/src/config/javaConfig.js`)
   - Java 8和11共用JAR：`mule-secure-props-java8-11.jar`
   - Java 17独立JAR：`mule-secure-props-java17.jar`
   - 通过环境变量配置Java路径

2. **环境变量** (`.env`)
   - `PORT` - 服务端口
   - `JAVA_HOME_8/11/17` - Java路径（可选）
   - `ENABLE_HISTORY` - 启用历史记录
   - `HISTORY_MAX_ENTRIES` - 最大历史记录数

3. **前端配置** (`frontend/vite.config.js`)
   - 开发代理配置
   - API基础URL配置

## 部署方式

1. **本地开发**: npm run dev
2. **Docker Compose**: docker-compose up -d
3. **独立Docker容器**: 分别构建前后端镜像

## 安全注意事项

1. 主密码不在日志中记录
2. 历史记录不保存敏感信息
3. 文件上传有大小限制（5MB）
4. 生产环境建议使用HTTPS
5. 建议实施API速率限制

