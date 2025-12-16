const { spawn } = require('child_process');
const { getJavaExecutable, getJarPath } = require('../config/javaConfig');

/**
 * 调用MuleSoft JAR进行加密
 * @param {string} plainText - 明文
 * @param {string} masterPassword - 主密码
 * @param {string} javaVersion - Java版本 ('1.8' | '11' | '17')
 * @returns {Promise<string>} 加密后的值（格式：![AES:...]）
 */
async function encrypt(plainText, masterPassword, javaVersion = '1.8') {
  return executeJar('encrypt', [plainText, masterPassword], javaVersion);
}

/**
 * 调用MuleSoft JAR进行解密
 * @param {string} encryptedValue - 密文（格式：![AES:...]）
 * @param {string} masterPassword - 主密码
 * @param {string} javaVersion - Java版本 ('1.8' | '11' | '17')
 * @returns {Promise<string>} 解密后的明文
 */
async function decrypt(encryptedValue, masterPassword, javaVersion = '1.8') {
  return executeJar('decrypt', [encryptedValue, masterPassword], javaVersion);
}

/**
 * 批量加密
 * @param {Array<{key: string, value: string}>} properties - 属性数组
 * @param {string} masterPassword - 主密码
 * @param {string} javaVersion - Java版本
 * @returns {Promise<Array<{key: string, value: string, encrypted: string}>>}
 */
async function batchEncrypt(properties, masterPassword, javaVersion = '1.8') {
  const results = [];
  for (const prop of properties) {
    try {
      const encrypted = await encrypt(prop.value, masterPassword, javaVersion);
      results.push({
        key: prop.key,
        value: prop.value,
        encrypted: encrypted,
        success: true
      });
    } catch (error) {
      results.push({
        key: prop.key,
        value: prop.value,
        encrypted: null,
        success: false,
        error: error.message
      });
    }
  }
  return results;
}

/**
 * 批量解密
 * @param {Array<{key: string, encrypted: string}>} properties - 加密属性数组
 * @param {string} masterPassword - 主密码
 * @param {string} javaVersion - Java版本
 * @returns {Promise<Array<{key: string, encrypted: string, decrypted: string}>>}
 */
async function batchDecrypt(properties, masterPassword, javaVersion = '1.8') {
  const results = [];
  for (const prop of properties) {
    try {
      const decrypted = await decrypt(prop.encrypted, masterPassword, javaVersion);
      results.push({
        key: prop.key,
        encrypted: prop.encrypted,
        decrypted: decrypted,
        success: true
      });
    } catch (error) {
      results.push({
        key: prop.key,
        encrypted: prop.encrypted,
        decrypted: null,
        success: false,
        error: error.message
      });
    }
  }
  return results;
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
      // 注意：根据实际MuleSoft JAR的参数格式调整
      const jarArgs = ['-jar', jarPath, command, ...args];
      
      console.log(`[JAR Service] Executing: ${javaExe} ${jarArgs.slice(0, 2).join(' ')} ${command} ...`);
      
      // 启动Java进程
      const javaProcess = spawn(javaExe, jarArgs, {
        cwd: require('path').dirname(jarPath),
        env: { ...process.env },
        encoding: 'utf8'
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
          console.error(`[JAR Service] Execution failed with exit code: ${code}`);
          console.error(`[JAR Service] Error: ${stderr}`);
          reject(new Error(`JAR执行失败: ${stderr || 'Unknown error'}`));
        } else {
          // 去除首尾空白字符
          const result = stdout.trim();
          if (!result) {
            reject(new Error('JAR执行成功但没有返回结果'));
          } else {
            resolve(result);
          }
        }
      });
      
      // 进程错误处理
      javaProcess.on('error', (error) => {
        console.error('[JAR Service] Failed to start Java process:', error);
        reject(new Error(`无法启动Java进程: ${error.message}. 请检查Java是否正确安装。`));
      });
      
      // 设置超时（默认30秒）
      const timeout = setTimeout(() => {
        javaProcess.kill();
        reject(new Error('JAR执行超时（30秒）'));
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
  decrypt,
  batchEncrypt,
  batchDecrypt
};

