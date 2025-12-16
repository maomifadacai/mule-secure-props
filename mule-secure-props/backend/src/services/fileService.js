const fs = require('fs').promises;
const path = require('path');

/**
 * 解析Properties文件内容
 * @param {string} content - Properties文件内容
 * @returns {Array<{key: string, value: string}>}
 */
function parseProperties(content) {
  const lines = content.split(/\r?\n/);
  const properties = [];
  
  for (const line of lines) {
    // 跳过空行和注释
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      continue;
    }
    
    // 解析 key=value 格式
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();
      
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      properties.push({ key, value });
    }
  }
  
  return properties;
}

/**
 * 格式化Properties文件内容
 * @param {Array<{key: string, value: string}>} properties - 属性数组
 * @returns {string} Properties格式的字符串
 */
function formatProperties(properties) {
  return properties
    .map(prop => `${prop.key}=${prop.value}`)
    .join('\n');
}

/**
 * 检查值是否为加密格式
 * @param {string} value - 属性值
 * @returns {boolean}
 */
function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith('![AES:');
}

/**
 * 从上传的文件读取内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} 文件内容
 */
async function readFileContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    throw new Error(`无法读取文件: ${error.message}`);
  }
}

/**
 * 写入文件
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 */
async function writeFileContent(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`无法写入文件: ${error.message}`);
  }
}

/**
 * 删除文件
 * @param {string} filePath - 文件路径
 */
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // 忽略文件不存在的错误
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  parseProperties,
  formatProperties,
  isEncrypted,
  readFileContent,
  writeFileContent,
  deleteFile
};

