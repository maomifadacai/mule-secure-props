require('dotenv').config();
const express = require('express');
const cors = require('cors');
const securePropsRoutes = require('./controllers/securePropsController');
const { getSupportedVersions } = require('./config/javaConfig');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supportedVersions: getSupportedVersions()
  });
});

// API路由
app.use('/api/v1', securePropsRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Mule Secure Props API服务器运行在端口 ${PORT}`);
  console.log(`支持的Java版本: ${getSupportedVersions().join(', ')}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.ENABLE_HISTORY === 'true') {
    console.log(`历史记录功能: 已启用 (最大 ${process.env.HISTORY_MAX_ENTRIES || 100} 条)`);
  }
  console.log('='.repeat(50));
});

module.exports = app;

