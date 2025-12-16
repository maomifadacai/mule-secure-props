const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const HISTORY_DIR = path.join(__dirname, '../../history');
const MAX_ENTRIES = parseInt(process.env.HISTORY_MAX_ENTRIES || '100');
const ENABLE_HISTORY = process.env.ENABLE_HISTORY === 'true';

/**
 * 确保历史记录目录存在
 */
async function ensureHistoryDir() {
  if (!ENABLE_HISTORY) return;
  
  try {
    await fs.mkdir(HISTORY_DIR, { recursive: true });
  } catch (error) {
    console.error('[History Service] Failed to create history directory:', error);
  }
}

/**
 * 保存历史记录
 * @param {Object} record - 历史记录对象
 */
async function saveHistory(record) {
  if (!ENABLE_HISTORY) return null;
  
  try {
    await ensureHistoryDir();
    
    const historyEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      operation: record.operation, // 'encrypt' | 'decrypt'
      javaVersion: record.javaVersion,
      success: record.success,
      // 不保存敏感信息（密码和明文）
      key: record.key || null,
      // 只保存密文的哈希值用于识别（不保存完整密文）
      encryptedHash: record.encrypted ? hashString(record.encrypted) : null,
      error: record.error || null
    };
    
    const historyFile = path.join(HISTORY_DIR, 'history.json');
    
    // 读取现有历史
    let history = [];
    try {
      const data = await fs.readFile(historyFile, 'utf8');
      history = JSON.parse(data);
    } catch (error) {
      // 文件不存在或解析失败，使用空数组
    }
    
    // 添加新记录
    history.unshift(historyEntry);
    
    // 限制历史记录数量
    if (history.length > MAX_ENTRIES) {
      history = history.slice(0, MAX_ENTRIES);
    }
    
    // 保存历史
    await fs.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf8');
    
    return historyEntry.id;
  } catch (error) {
    console.error('[History Service] Failed to save history:', error);
    return null;
  }
}

/**
 * 获取历史记录
 * @param {number} limit - 返回记录数量限制
 * @returns {Promise<Array>}
 */
async function getHistory(limit = 50) {
  if (!ENABLE_HISTORY) return [];
  
  try {
    const historyFile = path.join(HISTORY_DIR, 'history.json');
    const data = await fs.readFile(historyFile, 'utf8');
    const history = JSON.parse(data);
    
    return history.slice(0, limit);
  } catch (error) {
    return [];
  }
}

/**
 * 清除历史记录
 */
async function clearHistory() {
  if (!ENABLE_HISTORY) return;
  
  try {
    const historyFile = path.join(HISTORY_DIR, 'history.json');
    await fs.unlink(historyFile);
  } catch (error) {
    // 文件不存在，忽略错误
  }
}

/**
 * 简单的字符串哈希函数（用于生成标识符，非加密用途）
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

module.exports = {
  saveHistory,
  getHistory,
  clearHistory,
  isEnabled: () => ENABLE_HISTORY
};

