import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API方法
export const apiService = {
  // 获取支持的Java版本
  getVersions: () => api.get('/versions'),
  
  // 健康检查
  health: () => api.get('/health'),
  
  // 加密
  encrypt: (plainText, masterPassword, javaVersion = '1.8') => 
    api.post('/encrypt', { plainText, masterPassword, javaVersion }),
  
  // 解密
  decrypt: (encryptedValue, masterPassword, javaVersion = '1.8') => 
    api.post('/decrypt', { encryptedValue, masterPassword, javaVersion }),
  
  // 批量加密
  batchEncrypt: (properties, masterPassword, javaVersion = '1.8') =>
    api.post('/batch/encrypt', { properties, masterPassword, javaVersion }),
  
  // 批量解密
  batchDecrypt: (properties, masterPassword, javaVersion = '1.8') =>
    api.post('/batch/decrypt', { properties, masterPassword, javaVersion }),
  
  // 文件加密
  encryptFile: (file, masterPassword, javaVersion = '1.8') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('masterPassword', masterPassword);
    formData.append('javaVersion', javaVersion);
    return api.post('/file/encrypt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 文件解密
  decryptFile: (file, masterPassword, javaVersion = '1.8') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('masterPassword', masterPassword);
    formData.append('javaVersion', javaVersion);
    return api.post('/file/decrypt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 生成密钥
  generateKey: (type = 'password', length, options) =>
    api.post('/key/generate', { type, length, options }),
  
  // 获取历史记录
  getHistory: (limit = 50) => api.get('/history', { params: { limit } }),
  
  // 清除历史记录
  clearHistory: () => api.delete('/history')
};

export default apiService;

