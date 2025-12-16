const path = require('path');

/**
 * Java版本配置
 * MuleSoft提供的JAR文件：
 * - Java 8 和 11 共用同一个JAR文件
 * - Java 17 使用独立的JAR文件
 */
const JAVA_CONFIG = {
  '1.8': {
    javaHome: process.env.JAVA_HOME_8 || null,
    // Java 8 和 11 使用同一个JAR文件
    jarPath: path.join(__dirname, '../../jars/mule-secure-props-java8-11.jar'),
  },
  '11': {
    javaHome: process.env.JAVA_HOME_11 || null,
    // Java 8 和 11 使用同一个JAR文件
    jarPath: path.join(__dirname, '../../jars/mule-secure-props-java8-11.jar'),
  },
  '17': {
    javaHome: process.env.JAVA_HOME_17 || null,
    // Java 17 使用独立的JAR文件
    jarPath: path.join(__dirname, '../../jars/mule-secure-props-java17.jar'),
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
    throw new Error(`JAR file not found: ${config.jarPath}. Please ensure MuleSoft JAR files are placed in the jars/ directory.`);
  }
  
  return config.jarPath;
}

/**
 * 获取支持的Java版本列表
 */
function getSupportedVersions() {
  return Object.keys(JAVA_CONFIG);
}

module.exports = {
  JAVA_CONFIG,
  getJavaExecutable,
  getJarPath,
  getSupportedVersions
};

