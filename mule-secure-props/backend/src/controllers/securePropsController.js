const express = require('express');
const router = express.Router();
const jarService = require('../services/jarService');
const historyService = require('../services/historyService');
const keyGenerator = require('../services/keyGenerator');
const fileService = require('../services/fileService');
const { getSupportedVersions } = require('../config/javaConfig');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// 配置文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.properties', '.txt', '.prop'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 .properties, .txt, .prop 文件'));
    }
  }
});

/**
 * 健康检查
 * GET /api/v1/health
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supportedVersions: getSupportedVersions()
  });
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
    
    if (!getSupportedVersions().includes(javaVersion)) {
      return res.status(400).json({
        error: `Unsupported Java version: ${javaVersion}. Supported versions: ${getSupportedVersions().join(', ')}`
      });
    }
    
    // 调用JAR进行加密
    const encryptedValue = await jarService.encrypt(
      plainText,
      masterPassword,
      javaVersion
    );
    
    // 保存历史记录（如果启用）
    await historyService.saveHistory({
      operation: 'encrypt',
      javaVersion,
      success: true,
      encrypted: encryptedValue
    });
    
    res.json({
      encryptedValue,
      javaVersion,
      algorithm: 'AES'
    });
    
  } catch (error) {
    console.error('加密失败:', error);
    
    // 保存失败记录
    await historyService.saveHistory({
      operation: 'encrypt',
      javaVersion: req.body.javaVersion || '1.8',
      success: false,
      error: error.message
    });
    
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
    
    if (!getSupportedVersions().includes(javaVersion)) {
      return res.status(400).json({
        error: `Unsupported Java version: ${javaVersion}. Supported versions: ${getSupportedVersions().join(', ')}`
      });
    }
    
    // 调用JAR进行解密
    const plainText = await jarService.decrypt(
      encryptedValue,
      masterPassword,
      javaVersion
    );
    
    // 保存历史记录（如果启用）
    await historyService.saveHistory({
      operation: 'decrypt',
      javaVersion,
      success: true,
      encrypted: encryptedValue
    });
    
    res.json({
      plainText,
      javaVersion
    });
    
  } catch (error) {
    console.error('解密失败:', error);
    
    // 保存失败记录
    await historyService.saveHistory({
      operation: 'decrypt',
      javaVersion: req.body.javaVersion || '1.8',
      success: false,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Decryption failed',
      message: error.message
    });
  }
});

/**
 * 批量加密
 * POST /api/v1/batch/encrypt
 */
router.post('/batch/encrypt', async (req, res) => {
  try {
    const { properties, javaVersion = '1.8', masterPassword } = req.body;
    
    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid properties array'
      });
    }
    
    if (!masterPassword) {
      return res.status(400).json({
        error: 'Missing required parameter: masterPassword'
      });
    }
    
    const results = await jarService.batchEncrypt(properties, masterPassword, javaVersion);
    
    res.json({
      results,
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
    
  } catch (error) {
    console.error('批量加密失败:', error);
    res.status(500).json({
      error: 'Batch encryption failed',
      message: error.message
    });
  }
});

/**
 * 批量解密
 * POST /api/v1/batch/decrypt
 */
router.post('/batch/decrypt', async (req, res) => {
  try {
    const { properties, javaVersion = '1.8', masterPassword } = req.body;
    
    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid properties array'
      });
    }
    
    if (!masterPassword) {
      return res.status(400).json({
        error: 'Missing required parameter: masterPassword'
      });
    }
    
    const results = await jarService.batchDecrypt(properties, masterPassword, javaVersion);
    
    res.json({
      results,
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
    
  } catch (error) {
    console.error('批量解密失败:', error);
    res.status(500).json({
      error: 'Batch decryption failed',
      message: error.message
    });
  }
});

/**
 * 上传Properties文件并批量处理
 * POST /api/v1/file/encrypt
 * POST /api/v1/file/decrypt
 */
router.post('/file/encrypt', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const { javaVersion = '1.8', masterPassword } = req.body;
    
    if (!masterPassword) {
      await fileService.deleteFile(req.file.path);
      return res.status(400).json({ error: 'Missing required parameter: masterPassword' });
    }
    
    // 读取文件内容
    const content = await fileService.readFileContent(req.file.path);
    
    // 解析Properties
    const properties = fileService.parseProperties(content);
    
    if (properties.length === 0) {
      await fileService.deleteFile(req.file.path);
      return res.status(400).json({ error: 'No valid properties found in file' });
    }
    
    // 批量加密
    const results = await jarService.batchEncrypt(properties, masterPassword, javaVersion);
    
    // 生成结果文件
    const resultProperties = results.map(r => ({
      key: r.key,
      value: r.success ? r.encrypted : r.value
    }));
    
    const resultContent = fileService.formatProperties(resultProperties);
    
    // 清理上传的文件
    await fileService.deleteFile(req.file.path);
    
    res.json({
      originalCount: properties.length,
      encryptedCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      results: resultContent,
      resultsFormatted: resultProperties,
      errors: results.filter(r => !r.success).map(r => ({
        key: r.key,
        error: r.error
      }))
    });
    
  } catch (error) {
    console.error('文件加密失败:', error);
    
    // 清理文件
    if (req.file) {
      await fileService.deleteFile(req.file.path);
    }
    
    res.status(500).json({
      error: 'File encryption failed',
      message: error.message
    });
  }
});

router.post('/file/decrypt', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const { javaVersion = '1.8', masterPassword } = req.body;
    
    if (!masterPassword) {
      await fileService.deleteFile(req.file.path);
      return res.status(400).json({ error: 'Missing required parameter: masterPassword' });
    }
    
    // 读取文件内容
    const content = await fileService.readFileContent(req.file.path);
    
    // 解析Properties
    const properties = fileService.parseProperties(content);
    
    // 只解密加密的属性
    const encryptedProperties = properties
      .filter(p => fileService.isEncrypted(p.value))
      .map(p => ({ key: p.key, encrypted: p.value }));
    
    if (encryptedProperties.length === 0) {
      await fileService.deleteFile(req.file.path);
      return res.status(400).json({ error: 'No encrypted properties found in file' });
    }
    
    // 批量解密
    const results = await jarService.batchDecrypt(encryptedProperties, masterPassword, javaVersion);
    
    // 生成结果：解密的值替换加密的值，保留未加密的属性
    const decryptedMap = new Map(results.map(r => [r.key, r.decrypted]));
    const resultProperties = properties.map(p => ({
      key: p.key,
      value: decryptedMap.has(p.key) ? decryptedMap.get(p.key) : p.value
    }));
    
    const resultContent = fileService.formatProperties(resultProperties);
    
    // 清理上传的文件
    await fileService.deleteFile(req.file.path);
    
    res.json({
      originalCount: properties.length,
      encryptedCount: encryptedProperties.length,
      decryptedCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      results: resultContent,
      resultsFormatted: resultProperties,
      errors: results.filter(r => !r.success).map(r => ({
        key: r.key,
        error: r.error
      }))
    });
    
  } catch (error) {
    console.error('文件解密失败:', error);
    
    // 清理文件
    if (req.file) {
      await fileService.deleteFile(req.file.path);
    }
    
    res.status(500).json({
      error: 'File decryption failed',
      message: error.message
    });
  }
});

/**
 * 生成密钥
 * POST /api/v1/key/generate
 */
router.post('/key/generate', (req, res) => {
  try {
    const { type = 'password', length, options } = req.body;
    
    let key;
    
    if (type === 'password') {
      key = keyGenerator.generateRandomPassword(length || 16, options || {});
    } else if (type === 'hex') {
      key = keyGenerator.generateSecureKey(length || 32, 'hex');
    } else if (type === 'base64') {
      key = keyGenerator.generateSecureKey(length || 32, 'base64');
    } else if (type === 'uuid') {
      key = keyGenerator.generateUUID();
    } else {
      return res.status(400).json({
        error: `Unsupported key type: ${type}. Supported types: password, hex, base64, uuid`
      });
    }
    
    res.json({
      key,
      type,
      length: key.length
    });
    
  } catch (error) {
    console.error('密钥生成失败:', error);
    res.status(500).json({
      error: 'Key generation failed',
      message: error.message
    });
  }
});

/**
 * 获取历史记录
 * GET /api/v1/history
 */
router.get('/history', async (req, res) => {
  try {
    if (!historyService.isEnabled()) {
      return res.status(404).json({
        error: 'History feature is not enabled'
      });
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const history = await historyService.getHistory(limit);
    
    res.json({
      history,
      count: history.length
    });
    
  } catch (error) {
    console.error('获取历史记录失败:', error);
    res.status(500).json({
      error: 'Failed to get history',
      message: error.message
    });
  }
});

/**
 * 清除历史记录
 * DELETE /api/v1/history
 */
router.delete('/history', async (req, res) => {
  try {
    if (!historyService.isEnabled()) {
      return res.status(404).json({
        error: 'History feature is not enabled'
      });
    }
    
    await historyService.clearHistory();
    
    res.json({
      message: 'History cleared successfully'
    });
    
  } catch (error) {
    console.error('清除历史记录失败:', error);
    res.status(500).json({
      error: 'Failed to clear history',
      message: error.message
    });
  }
});

module.exports = router;

