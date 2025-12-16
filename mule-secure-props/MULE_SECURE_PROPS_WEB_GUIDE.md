# Mule Secure Properties 在线加解密网站开发指南

## 项目概述

本文档描述了如何构建一个支持Mule Secure Properties在线加密和解密的Web应用。该工具需要支持多个Java版本（JDK 1.8、Java 11、Java 17），以便兼容不同版本的Mule运行时环境。

**重要提示**: 本方案基于使用MuleSoft提供的现成JAR文件。如果已有MuleSoft的加解密JAR文件，推荐使用**Node.js + Java子进程方案**，通过Node.js服务调用不同Java版本的JAR文件，无需修改JAR文件本身。

**JAR文件说明**: 
- MuleSoft只提供**2个JAR文件**（不是3个）
- `mule-secure-props-java8-11.jar` - 适用于Java 8和Java 11（共用同一个JAR）
- `mule-secure-props-java17.jar` - 仅适用于Java 17
- 虽然Java 8和11使用同一个JAR文件，但必须使用各自对应版本的JDK来运行
  - Java 8请求 → 使用JDK 1.8运行`mule-secure-props-java8-11.jar`
  - Java 11请求 → 使用JDK 11运行`mule-secure-props-java8-11.jar`
  - Java 17请求 → 使用JDK 17运行`mule-secure-props-java17.jar`

## 技术架构

### 后端技术栈

#### 方案一：Node.js + Java子进程（**强烈推荐** ⭐）

**适用场景**: 已有MuleSoft提供的Java 8/11/17加解密JAR文件

- **主服务**: Node.js + Express/Fastify
- **加密引擎**: 通过子进程调用MuleSoft提供的JAR文件
- **Java运行时**: 系统需安装JDK 1.8、Java 11、Java 17（或通过Docker容器）
- **优势**: 
  - ✅ 单一服务入口，统一API接口
  - ✅ 无需修改JAR文件，直接调用现成工具
  - ✅ 灵活选择Java版本，根据请求参数动态调用
  - ✅ 易于维护，JAR文件独立更新不影响服务
  - ✅ 轻量级，Node.js服务本身资源占用小

#### 方案二：Java + Spring Boot（备选）
- **框架**: Spring Boot 2.7.x / 3.x
- **语言**: Java 8/11/17（多版本支持）
- **加密库**: 
  - 将MuleSoft JAR作为依赖引入
  - 需要为每个Java版本分别打包
- **部署**: 可部署为JAR或WAR包
- **缺点**: 需要维护多个版本的服务实例

### 前端技术栈

- **框架**: React / Vue.js / 原生HTML+JavaScript
- **UI组件库**: Material-UI / Ant Design / Bootstrap
- **构建工具**: Vite / Webpack

### 多Java版本支持方案（使用MuleSoft JAR文件）

#### 推荐架构：Node.js + 多Java运行时

```
服务架构（推荐）：
├── Web前端 (静态文件服务)
├── Node.js API服务
│   ├── 系统环境
│   │   ├── JAVA_HOME_8 → JDK 1.8路径
│   │   ├── JAVA_HOME_11 → JDK 11路径
│   │   └── JAVA_HOME_17 → JDK 17路径
│   └── JAR文件目录（MuleSoft提供的2个JAR文件）
│       ├── mule-secure-props-java8-11.jar  (Java 8和11共用)
│       └── mule-secure-props-java17.jar    (Java 17专用)
└── 请求流程
    └── 根据javaVersion参数 → 选择对应JDK → 执行对应JAR
        ├── Java 8 → JDK 1.8 + java8-11.jar
        ├── Java 11 → JDK 11 + java8-11.jar
        └── Java 17 → JDK 17 + java17.jar
```

**工作原理**：
1. 前端请求时指定Java版本（1.8/11/17）
2. Node.js服务根据版本选择对应的JDK路径
3. 通过`child_process.spawn()`调用`java -jar`命令执行对应JAR
4. 将参数传递给JAR的main方法
5. 读取JAR输出并返回给前端

#### 备选方案：Docker容器化

```
├── Web前端 (Nginx)
├── Node.js API服务容器
└── 多个Java运行时容器（可选）
    ├── Java 8容器（包含JAR）
    ├── Java 11容器（包含JAR）
    └── Java 17容器（包含JAR）
```

## Mule Secure Properties加密原理

### 加密算法
Mule Secure Properties通常使用以下加密方式：
1. **AES加密**（Advanced Encryption Standard）
2. **PBE (Password-Based Encryption)**，使用PBKDF2
3. 密钥派生：从主密码生成加密密钥

### 关键参数
- **算法**: AES/CBC/PKCS5Padding 或 AES/GCM/NoPadding
- **密钥长度**: 128/192/256位
- **IV (Initialization Vector)**: 随机生成或固定
- **盐值 (Salt)**: 用于密钥派生

### Mule配置文件格式
```
# 加密属性格式
secure.properties=![AES:encrypted_value]
```

## 实现方案详细设计

### 1. 后端API设计

#### RESTful API端点

```http
POST /api/v1/encrypt
Content-Type: application/json

{
  "plainText": "your_secret_value",
  "javaVersion": "1.8|11|17",
  "algorithm": "AES",
  "masterPassword": "your_master_password"
}

Response:
{
  "encryptedValue": "![AES:...]",
  "javaVersion": "1.8",
  "algorithm": "AES"
}
```

```http
POST /api/v1/decrypt
Content-Type: application/json

{
  "encryptedValue": "![AES:encrypted_value]",
  "javaVersion": "1.8|11|17",
  "masterPassword": "your_master_password"
}

Response:
{
  "plainText": "your_secret_value",
  "javaVersion": "1.8"
}
```

```http
GET /api/v1/versions
Response:
{
  "supportedVersions": ["1.8", "11", "17"],
  "defaultVersion": "1.8"
}
```

### 2. Node.js后端实现（调用MuleSoft JAR文件）

#### 项目结构

```
backend/
├── src/
│   ├── config/
│   │   └── javaConfig.js          # Java版本配置
│   ├── services/
│   │   └── jarService.js          # JAR调用服务
│   ├── controllers/
│   │   └── securePropsController.js
│   └── app.js                     # Express应用入口
├── jars/                          # MuleSoft提供的JAR文件目录（共2个）
│   ├── mule-secure-props-java8-11.jar  (Java 8和11共用)
│   └── mule-secure-props-java17.jar    (Java 17专用)
├── package.json
└── .env                           # 环境变量配置
```

#### 2.1 Java运行时配置 (config/javaConfig.js)

**重要**: MuleSoft提供的JAR文件只有2个：
- **JAR for Java 8 & 11**: 适用于Java 8和Java 11（共用同一个JAR文件）
- **JAR for Java 17**: 仅适用于Java 17

```javascript
const path = require('path');

/**
 * Java版本配置
 * MuleSoft提供的JAR文件：
 * - Java 8 和 11 共用同一个JAR文件
 * - Java 17 使用独立的JAR文件
 */
const JAVA_CONFIG = {
  '1.8': {
    javaHome: process.env.JAVA_HOME_8 || '/usr/lib/jvm/java-8-openjdk',
    // Java 8 和 11 使用同一个JAR文件
    jarPath: path.join(__dirname, '../jars/mule-secure-props-java8-11.jar'),
    // Windows示例: 'C:\\Program Files\\Java\\jdk1.8.0_xxx'
  },
  '11': {
    javaHome: process.env.JAVA_HOME_11 || '/usr/lib/jvm/java-11-openjdk',
    // Java 8 和 11 使用同一个JAR文件
    jarPath: path.join(__dirname, '../jars/mule-secure-props-java8-11.jar'),
  },
  '17': {
    javaHome: process.env.JAVA_HOME_17 || '/usr/lib/jvm/java-17-openjdk',
    // Java 17 使用独立的JAR文件
    jarPath: path.join(__dirname, '../jars/mule-secure-props-java17.jar'),
  }
};

/**
 * 获取Java可执行文件路径
 */
function getJavaExecutable(javaVersion) {
  const config = JAVA_CONFIG[javaVersion];
  if (!config) {
    throw new Error(`Unsupported Java version: ${javaVersion}`);
  }
  
  const isWindows = process.platform === 'win32';
  const javaExe = isWindows ? 'java.exe' : 'java';
  
  // 优先使用JAVA_HOME，否则使用系统PATH中的java
  if (config.javaHome) {
    return path.join(config.javaHome, 'bin', javaExe);
  }
  
  return javaExe; // 使用系统PATH
}

/**
 * 获取JAR文件路径
 */
function getJarPath(javaVersion) {
  const config = JAVA_CONFIG[javaVersion];
  if (!config) {
    throw new Error(`Unsupported Java version: ${javaVersion}`);
  }
  
  const fs = require('fs');
  if (!fs.existsSync(config.jarPath)) {
    throw new Error(`JAR file not found: ${config.jarPath}`);
  }
  
  return config.jarPath;
}

module.exports = {
  JAVA_CONFIG,
  getJavaExecutable,
  getJarPath,
  getSupportedVersions: () => Object.keys(JAVA_CONFIG)
};
```

#### 2.2 JAR调用服务 (services/jarService.js)

```javascript
const { spawn } = require('child_process');
const { getJavaExecutable, getJarPath } = require('../config/javaConfig');

/**
 * 调用MuleSoft JAR进行加密
 * 假设JAR的main方法接受参数格式: encrypt <plainText> <masterPassword>
 */
async function encrypt(plainText, masterPassword, javaVersion = '1.8') {
  return executeJar('encrypt', [plainText, masterPassword], javaVersion);
}

/**
 * 调用MuleSoft JAR进行解密
 * 假设JAR的main方法接受参数格式: decrypt <encryptedValue> <masterPassword>
 */
async function decrypt(encryptedValue, masterPassword, javaVersion = '1.8') {
  return executeJar('decrypt', [encryptedValue, masterPassword], javaVersion);
}

/**
 * 执行JAR文件的通用方法
 * @param {string} command - 命令（encrypt/decrypt）
 * @param {string[]} args - 参数数组
 * @param {string} javaVersion - Java版本
 * @returns {Promise<string>} JAR输出结果
 */
function executeJar(command, args, javaVersion) {
  return new Promise((resolve, reject) => {
    try {
      const javaExe = getJavaExecutable(javaVersion);
      const jarPath = getJarPath(javaVersion);
      
      // 构建命令参数
      // 格式: java -jar <jar> <command> <arg1> <arg2>
      const jarArgs = ['-jar', jarPath, command, ...args];
      
      console.log(`执行命令: ${javaExe} ${jarArgs.join(' ')}`);
      
      // 启动Java进程
      const javaProcess = spawn(javaExe, jarArgs, {
        cwd: require('path').dirname(jarPath),
        env: { ...process.env }
      });
      
      let stdout = '';
      let stderr = '';
      
      // 收集标准输出
      javaProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      // 收集错误输出
      javaProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // 进程结束处理
      javaProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`JAR执行失败，退出码: ${code}`);
          console.error(`错误信息: ${stderr}`);
          reject(new Error(`JAR执行失败: ${stderr || 'Unknown error'}`));
        } else {
          // 去除首尾空白字符
          const result = stdout.trim();
          resolve(result);
        }
      });
      
      // 进程错误处理
      javaProcess.on('error', (error) => {
        console.error('启动Java进程失败:', error);
        reject(new Error(`无法启动Java进程: ${error.message}`));
      });
      
      // 设置超时（可选，默认30秒）
      const timeout = setTimeout(() => {
        javaProcess.kill();
        reject(new Error('JAR执行超时'));
      }, 30000);
      
      javaProcess.on('close', () => {
        clearTimeout(timeout);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  encrypt,
  decrypt
};
```

**注意**: 如果MuleSoft的JAR文件接受不同的参数格式（例如JSON输入或文件输入），需要相应调整`executeJar`函数。

#### 2.3 Express控制器 (controllers/securePropsController.js)

```javascript
const express = require('express');
const router = express.Router();
const jarService = require('../services/jarService');
const { getSupportedVersions } = require('../config/javaConfig');

/**
 * 加密接口
 * POST /api/v1/encrypt
 */
router.post('/encrypt', async (req, res) => {
  try {
    const { plainText, javaVersion = '1.8', masterPassword } = req.body;
    
    // 参数验证
    if (!plainText || !masterPassword) {
      return res.status(400).json({
        error: 'Missing required parameters: plainText and masterPassword'
      });
    }
    
    // 调用JAR进行加密
    const encryptedValue = await jarService.encrypt(
      plainText,
      masterPassword,
      javaVersion
    );
    
    res.json({
      encryptedValue,
      javaVersion,
      algorithm: 'AES'
    });
    
  } catch (error) {
    console.error('加密失败:', error);
    res.status(500).json({
      error: 'Encryption failed',
      message: error.message
    });
  }
});

/**
 * 解密接口
 * POST /api/v1/decrypt
 */
router.post('/decrypt', async (req, res) => {
  try {
    const { encryptedValue, javaVersion = '1.8', masterPassword } = req.body;
    
    // 参数验证
    if (!encryptedValue || !masterPassword) {
      return res.status(400).json({
        error: 'Missing required parameters: encryptedValue and masterPassword'
      });
    }
    
    // 调用JAR进行解密
    const plainText = await jarService.decrypt(
      encryptedValue,
      masterPassword,
      javaVersion
    );
    
    res.json({
      plainText,
      javaVersion
    });
    
  } catch (error) {
    console.error('解密失败:', error);
    res.status(500).json({
      error: 'Decryption failed',
      message: error.message
    });
  }
});

/**
 * 获取支持的Java版本
 * GET /api/v1/versions
 */
router.get('/versions', (req, res) => {
  res.json({
    supportedVersions: getSupportedVersions(),
    defaultVersion: '1.8'
  });
});

module.exports = router;
```

#### 2.4 Express应用入口 (app.js)

```javascript
const express = require('express');
const cors = require('cors');
const securePropsRoutes = require('./controllers/securePropsController');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/v1', securePropsRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mule Secure Props API服务器运行在端口 ${PORT}`);
  console.log(`支持的Java版本: ${require('./config/javaConfig').getSupportedVersions().join(', ')}`);
});

module.exports = app;
```

#### 2.5 package.json

```json
{
  "name": "mule-secure-props-api",
  "version": "1.0.0",
  "description": "Mule Secure Properties在线加解密API服务",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

#### 2.6 环境变量配置 (.env)

```bash
# Java运行时路径（可选，如果已配置系统PATH可省略）
# Windows示例
JAVA_HOME_8=C:\Program Files\Java\jdk1.8.0_xxx
JAVA_HOME_11=C:\Program Files\Java\jdk-11.0.x
JAVA_HOME_17=C:\Program Files\Java\jdk-17.0.x

# Linux/Mac示例
# JAVA_HOME_8=/usr/lib/jvm/java-8-openjdk-amd64
# JAVA_HOME_11=/usr/lib/jvm/java-11-openjdk-amd64
# JAVA_HOME_17=/usr/lib/jvm/java-17-openjdk-amd64

# 服务端口
PORT=8080

# JAR文件路径（如果不在默认位置）
# JARS_DIR=./jars

# 注意：MuleSoft提供的JAR文件只有2个：
# - mule-secure-props-java8-11.jar (Java 8和11共用)
# - mule-secure-props-java17.jar (Java 17专用)
```

#### 2.7 处理MuleSoft JAR文件的参数格式

**重要说明**: 
- MuleSoft提供的JAR文件只有2个，不是每个Java版本一个
- Java 8和Java 11使用同一个JAR文件（但需要各自对应版本的JDK来运行）
- Java 17使用独立的JAR文件
- 请根据实际JAR文件名调整配置文件中的路径

**重要**: MuleSoft提供的JAR文件可能有不同的参数传递方式，需要根据实际情况调整`jarService.js`中的`executeJar`函数。

##### 情况1：命令行参数方式（最常见）

如果JAR的main方法接受命令行参数，例如：
```bash
java -jar mule-secure-props.jar encrypt "plainText" "masterPassword"
```

当前代码已支持此方式。

##### 情况2：JSON输入方式

如果JAR接受JSON格式的输入，需要修改`executeJar`函数：

```javascript
function executeJar(command, args, javaVersion) {
  return new Promise((resolve, reject) => {
    try {
      const javaExe = getJavaExecutable(javaVersion);
      const jarPath = getJarPath(javaVersion);
      
      // 构建JSON输入
      const input = {
        command: command,
        data: args[0],  // plainText 或 encryptedValue
        masterPassword: args[1]
      };
      
      const javaProcess = spawn(javaExe, ['-jar', jarPath], {
        cwd: require('path').dirname(jarPath),
        env: { ...process.env }
      });
      
      // 通过stdin发送JSON
      javaProcess.stdin.write(JSON.stringify(input));
      javaProcess.stdin.end();
      
      // ... 其余代码相同
    } catch (error) {
      reject(error);
    }
  });
}
```

##### 情况3：文件输入方式

如果JAR需要从文件读取输入：

```javascript
const fs = require('fs');
const os = require('os');
const path = require('path');

function executeJar(command, args, javaVersion) {
  return new Promise((resolve, reject) => {
    try {
      // 创建临时文件
      const tempFile = path.join(os.tmpdir(), `mule-secure-props-${Date.now()}.json`);
      const input = {
        command: command,
        data: args[0],
        masterPassword: args[1]
      };
      
      fs.writeFileSync(tempFile, JSON.stringify(input));
      
      const javaExe = getJavaExecutable(javaVersion);
      const jarPath = getJarPath(javaVersion);
      
      const javaProcess = spawn(javaExe, ['-jar', jarPath, tempFile], {
        cwd: require('path').dirname(jarPath),
        env: { ...process.env }
      });
      
      let stdout = '';
      let stderr = '';
      
      javaProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      javaProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      javaProcess.on('close', (code) => {
        // 清理临时文件
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          console.warn('Failed to delete temp file:', e);
        }
        
        if (code !== 0) {
          reject(new Error(`JAR执行失败: ${stderr || 'Unknown error'}`));
        } else {
          resolve(stdout.trim());
        }
      });
      
      javaProcess.on('error', (error) => {
        reject(new Error(`无法启动Java进程: ${error.message}`));
      });
      
    } catch (error) {
      reject(error);
    }
  });
}
```

##### 情况4：自定义main类

如果JAR需要指定main类：

```javascript
const jarArgs = ['-cp', jarPath, 'com.mulesoft.secureprops.Main', command, ...args];
```

##### 测试JAR文件参数格式

在集成之前，可以先手动测试JAR文件：

```bash
# 测试Java 8/11 JAR（使用对应版本的JDK）
java8 -jar jars/mule-secure-props-java8-11.jar encrypt "test" "password"
# 或
java11 -jar jars/mule-secure-props-java8-11.jar encrypt "test" "password"

# 测试Java 17 JAR
java17 -jar jars/mule-secure-props-java17.jar encrypt "test" "password"

# 测试解密（Java 17示例）
java17 -jar jars/mule-secure-props-java17.jar decrypt "![AES:...]" "password"

# 如果支持帮助信息
java17 -jar jars/mule-secure-props-java17.jar --help
# 或
java8 -jar jars/mule-secure-props-java8-11.jar --help
```

**注意**: 
- 确保使用对应Java版本的JDK来运行相应的JAR文件
- Java 8和11使用同一个JAR，但需要各自对应版本的JDK来运行
- 实际JAR文件名可能不同，请根据MuleSoft提供的实际文件名调整配置

### 3. 前端界面设计

#### React组件示例

```jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Select, MenuItem, Paper, Typography } from '@mui/material';

const MuleSecurePropsTool = () => {
  const [javaVersion, setJavaVersion] = useState('1.8');
  const [masterPassword, setMasterPassword] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plainText: inputText,
          javaVersion: javaVersion,
          masterPassword: masterPassword
        })
      });
      const data = await response.json();
      setOutputText(data.encryptedValue);
    } catch (error) {
      alert('加密失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedValue: inputText,
          javaVersion: javaVersion,
          masterPassword: masterPassword
        })
      });
      const data = await response.json();
      setOutputText(data.plainText);
    } catch (error) {
      alert('解密失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mule Secure Properties 加解密工具
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Select
          value={javaVersion}
          onChange={(e) => setJavaVersion(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="1.8">JDK 1.8</MenuItem>
          <MenuItem value="11">Java 11</MenuItem>
          <MenuItem value="17">Java 17</MenuItem>
        </Select>
      </Box>

      <TextField
        label="主密码 (Master Password)"
        type="password"
        fullWidth
        value={masterPassword}
        onChange={(e) => setMasterPassword(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label={mode === 'encrypt' ? '明文' : '密文'}
        multiline
        rows={4}
        fullWidth
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleEncrypt}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          加密
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDecrypt}
          disabled={loading}
        >
          解密
        </Button>
      </Box>

      <TextField
        label={mode === 'encrypt' ? '密文' : '明文'}
        multiline
        rows={4}
        fullWidth
        value={outputText}
        InputProps={{ readOnly: true }}
      />
    </Paper>
  );
};

export default MuleSecurePropsTool;
```

### 4. Docker部署配置（Node.js + 多Java版本）

#### 方案A：单一容器包含所有Java版本（推荐）

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - JAVA_HOME_8=/usr/lib/jvm/java-8-openjdk
      - JAVA_HOME_11=/usr/lib/jvm/java-11-openjdk
      - JAVA_HOME_17=/usr/lib/jvm/java-17-openjdk
      - PORT=8080
    volumes:
      # 如果需要挂载外部JAR文件
      - ./jars:/app/jars:ro
```

#### Dockerfile示例（包含多Java版本）

```dockerfile
# 使用包含多个Java版本的Docker镜像，或自行安装
FROM node:18-slim

# 安装多个Java版本
# 注意：实际部署时可以使用包含多Java版本的定制镜像
RUN apt-get update && apt-get install -y \
    openjdk-8-jdk \
    openjdk-11-jdk \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制Node.js应用
COPY package*.json ./
RUN npm install --production

COPY src ./src

# 复制MuleSoft JAR文件
COPY jars ./jars

# 设置Java环境变量
ENV JAVA_HOME_8=/usr/lib/jvm/java-8-openjdk-amd64
ENV JAVA_HOME_11=/usr/lib/jvm/java-11-openjdk-amd64
ENV JAVA_HOME_17=/usr/lib/jvm/java-17-openjdk-amd64
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/app.js"]
```

#### 方案B：使用多阶段构建（更灵活的镜像大小控制）

```dockerfile
# 阶段1: 构建包含所有Java版本的运行时镜像
FROM ubuntu:22.04 AS java-runtime

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# 安装OpenJDK 8
RUN apt-get update && apt-get install -y openjdk-8-jdk && \
    mkdir -p /usr/lib/jvm/java-8-openjdk

# 安装OpenJDK 11
RUN apt-get install -y openjdk-11-jdk && \
    mkdir -p /usr/lib/jvm/java-11-openjdk

# 安装OpenJDK 17
RUN apt-get install -y openjdk-17-jdk && \
    mkdir -p /usr/lib/jvm/java-17-openjdk

# 阶段2: Node.js应用
FROM node:18-slim

# 从java-runtime复制Java安装
COPY --from=java-runtime /usr/lib/jvm /usr/lib/jvm

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src
COPY jars ./jars

ENV JAVA_HOME_8=/usr/lib/jvm/java-8-openjdk-amd64
ENV JAVA_HOME_11=/usr/lib/jvm/java-11-openjdk-amd64
ENV JAVA_HOME_17=/usr/lib/jvm/java-17-openjdk-amd64
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/app.js"]
```

#### 轻量级Dockerfile（推荐用于生产）

```dockerfile
FROM node:18-slim

# 使用Adoptium（原AdoptOpenJDK）的多版本JDK安装脚本
# 或直接使用包含多Java版本的基础镜像
WORKDIR /app

# 安装多个Java版本（使用apt或手动安装）
RUN apt-get update && apt-get install -y \
    openjdk-8-jdk-headless \
    openjdk-11-jdk-headless \
    openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "src/app.js"]
```

### 5. 安全性考虑

1. **HTTPS**: 所有API请求必须使用HTTPS
2. **密码传输**: 主密码不应该在日志中记录
3. **输入验证**: 验证所有用户输入
4. **速率限制**: 实施API速率限制防止滥用
5. **CORS配置**: 正确配置跨域资源共享
6. **错误处理**: 避免泄露敏感信息的错误消息

### 6. 项目目录结构（Node.js方案）

```
mule-secure-props/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── javaConfig.js          # Java版本配置
│   │   ├── services/
│   │   │   └── jarService.js          # JAR调用服务
│   │   ├── controllers/
│   │   │   └── securePropsController.js
│   │   └── app.js                     # Express入口
│   ├── jars/                          # MuleSoft提供的JAR文件（共2个）
│   │   ├── mule-secure-props-java8-11.jar  (Java 8和11共用)
│   │   └── mule-secure-props-java17.jar    (Java 17专用)
│   ├── package.json
│   ├── .env                           # 环境变量配置
│   ├── .env.example                   # 环境变量示例
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── MuleSecurePropsTool.jsx
│   │   ├── services/
│   │   │   └── api.js                 # API调用服务
│   │   └── App.jsx
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.js
│   └── index.html
├── docker-compose.yml
├── README.md
└── MULE_SECURE_PROPS_WEB_GUIDE.md
```

## 部署步骤

### 1. 本地开发环境

#### 准备工作

1. **安装Node.js** (版本 >= 14.0.0)
2. **安装Java运行时**
   - JDK 1.8
   - JDK 11
   - JDK 17
3. **准备MuleSoft JAR文件**
   - 将2个JAR文件放置到 `backend/jars/` 目录
   - `mule-secure-props-java8-11.jar` - 用于Java 8和Java 11
   - `mule-secure-props-java17.jar` - 用于Java 17
   - 确保文件命名与配置中的路径一致

#### 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量（复制.env.example并修改）
cp .env.example .env
# 编辑.env文件，设置Java路径（如果需要）

# 启动开发服务器
npm run dev

# 或启动生产服务器
npm start
```

#### 启动前端服务

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 验证服务

```bash
# 检查后端健康状态
curl http://localhost:8080/health

# 检查支持的Java版本
curl http://localhost:8080/api/v1/versions
```

### 2. Docker部署

```bash
docker-compose up -d
```

### 3. 生产环境部署

- 使用Nginx作为反向代理
- 配置SSL证书
- 设置环境变量
- 监控和日志收集

## 测试

### API测试示例

```bash
# 加密测试
curl -X POST http://localhost:8080/api/v1/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "plainText": "mySecretPassword",
    "javaVersion": "17",
    "masterPassword": "masterKey123"
  }'

# 解密测试
curl -X POST http://localhost:8080/api/v1/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "encryptedValue": "![AES:...]",
    "javaVersion": "17",
    "masterPassword": "masterKey123"
  }'
```

## 注意事项

### JAR文件集成注意事项

1. **JAR文件数量和命名**: 
   - MuleSoft只提供2个JAR文件，不是每个Java版本一个
   - Java 8和Java 11共用同一个JAR文件（`mule-secure-props-java8-11.jar`）
   - Java 17使用独立的JAR文件（`mule-secure-props-java17.jar`）
   - 实际JAR文件名可能不同，请根据MuleSoft提供的实际文件名调整配置
   - 注意：虽然Java 8和11使用同一个JAR，但必须使用各自对应版本的JDK来运行

2. **JAR文件参数格式**: 
   - 首先需要确认MuleSoft JAR文件的参数传递方式（命令行参数/JSON/文件输入）
   - 根据实际情况调整`jarService.js`中的`executeJar`函数
   - 建议先用命令行手动测试JAR文件，确认参数格式

3. **Java版本路径配置**:
   - 确保`javaConfig.js`中的Java路径配置正确
   - Windows和Linux/Mac的路径格式不同，需要注意
   - 如果Java已在系统PATH中，可以不设置JAVA_HOME

4. **JAR文件权限**:
   - 确保JAR文件有执行权限
   - 确保Node.js进程有权限访问JAR文件目录

5. **字符编码和特殊字符**:
   - 命令行参数中的特殊字符需要正确转义
   - 确保JAR输出和输入使用UTF-8编码
   - 密码中的特殊字符可能需要转义处理

6. **错误处理**:
   - JAR执行失败时的错误信息可能包含在stderr中
   - 需要正确处理超时情况（长时间运行的JAR操作）
   - 建议添加重试机制处理临时性错误

### 通用注意事项

1. **Java版本兼容性**: MuleSoft提供的JAR文件已针对各Java版本优化，确保使用对应版本的JAR
2. **密钥管理**: 主密码不应该在日志中记录，也不应该在URL中传递
3. **性能优化**: 
   - 考虑对频繁调用的JAR操作添加缓存（如果适用）
   - 使用连接池管理Java进程（如果支持）
   - 考虑异步处理长时间运行的操作
4. **日志记录**: 记录操作日志但不包含敏感信息（明文密码、加密值等）
5. **安全性**:
   - 使用HTTPS传输敏感数据
   - 实施API速率限制防止滥用
   - 验证所有用户输入
6. **资源管理**:
   - Java进程会消耗内存，需要监控资源使用
   - 考虑限制并发JAR执行数量
   - 及时清理临时文件（如果使用文件输入方式）

## 扩展功能建议

1. **批量加解密**: 支持一次处理多个属性
2. **文件上传**: 支持直接上传properties文件进行批量处理
3. **历史记录**: 保存加解密历史（可选）
4. **多种加密算法**: 支持除AES外的其他算法
5. **密钥生成器**: 提供安全的随机密钥生成功能

## 常见问题排查

### JAR文件执行失败

1. **检查Java版本是否匹配**
   ```bash
   java -version
   ```

2. **手动测试JAR文件**
   ```bash
   # 测试Java 8/11 JAR
   java8 -jar jars/mule-secure-props-java8-11.jar --help
   # 或
   java11 -jar jars/mule-secure-props-java8-11.jar --help
   
   # 测试Java 17 JAR
   java17 -jar jars/mule-secure-props-java17.jar --help
   ```

3. **检查JAR文件路径**
   - 确认JAR文件存在于配置的路径
   - 检查文件权限

4. **查看Node.js日志**
   - 检查`jarService.js`中的错误日志
   - 查看Java进程的stderr输出

### Java进程无法启动

1. **检查Java环境变量**
   ```bash
   echo $JAVA_HOME_8
   echo $JAVA_HOME_11
   echo $JAVA_HOME_17
   ```

2. **检查Java可执行文件**
   ```bash
   which java
   /path/to/java/bin/java -version
   ```

3. **Windows系统注意**
   - 使用`java.exe`而不是`java`
   - 路径使用反斜杠或双反斜杠

### 编码问题

1. **确保使用UTF-8编码**
   ```javascript
   // 在spawn中设置编码
   const javaProcess = spawn(javaExe, jarArgs, {
     encoding: 'utf8'
   });
   ```

2. **处理特殊字符**
   - 对参数进行适当转义
   - 考虑使用Base64编码传递包含特殊字符的值

## 参考资料

- [MuleSoft Secure Properties Documentation](https://docs.mulesoft.com/)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [Java Cryptography Architecture](https://docs.oracle.com/javase/8/docs/technotes/guides/security/crypto/CryptoSpec.html)
- [Express.js Documentation](https://expressjs.com/)

