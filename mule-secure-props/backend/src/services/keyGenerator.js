const crypto = require('crypto');

/**
 * 生成安全的随机密钥
 * @param {number} length - 密钥长度（字节数）
 * @param {string} encoding - 编码格式 ('hex' | 'base64')
 * @returns {string} 生成的密钥
 */
function generateSecureKey(length = 32, encoding = 'hex') {
  const buffer = crypto.randomBytes(length);
  
  if (encoding === 'hex') {
    return buffer.toString('hex');
  } else if (encoding === 'base64') {
    return buffer.toString('base64');
  } else {
    return buffer.toString('hex');
  }
}

/**
 * 生成随机密码（可读格式）
 * @param {number} length - 密码长度
 * @param {Object} options - 选项
 * @returns {string} 生成的密码
 */
function generateRandomPassword(length = 16, options = {}) {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true // 排除相似字符（如0O, 1l等）
  } = options;
  
  let charset = '';
  
  if (includeUppercase) {
    charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 排除 I, O
  }
  if (includeLowercase) {
    charset += 'abcdefghijkmnpqrstuvwxyz'; // 排除 l, o
  }
  if (includeNumbers) {
    charset += '23456789'; // 排除 0, 1
  }
  if (includeSymbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  if (charset.length === 0) {
    throw new Error('At least one character set must be included');
  }
  
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
function generateUUID() {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
}

module.exports = {
  generateSecureKey,
  generateRandomPassword,
  generateUUID
};

