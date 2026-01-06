/**
 * 环境配置文件
 * 用于区分开发环境、测试环境和生产环境
 */

// 环境类型
const ENV_TYPE = {
  DEV: 'development',      // 开发环境（本地）
  TEST: 'test',           // 测试环境
  PROD: 'production'      // 生产环境
}

// 当前环境配置 - 修改这里切换环境
const CURRENT_ENV = ENV_TYPE.DEV

// 各环境的API配置
const ENV_CONFIG = {
  // 开发环境（本地开发）
  [ENV_TYPE.DEV]: {
    baseUrl: 'http://localhost:8000/api',
    name: '开发环境',
    debug: true
  },

  // 测试环境
  [ENV_TYPE.TEST]: {
    baseUrl: 'http://103.110.81.83/api',
    name: '测试环境',
    debug: true
  },

  // 生产环境
  [ENV_TYPE.PROD]: {
    baseUrl: 'https://yourdomain.com/api',  // 配置HTTPS后修改这里
    name: '生产环境',
    debug: false
  }
}

// 获取当前环境配置
function getEnvConfig() {
  const config = ENV_CONFIG[CURRENT_ENV]

  // 在控制台输出当前环境信息
  console.log(`[环境配置] 当前环境: ${config.name}`)
  console.log(`[环境配置] API地址: ${config.baseUrl}`)

  return config
}

// 导出配置
module.exports = {
  ENV_TYPE,
  CURRENT_ENV,
  getEnvConfig,
  // 直接导出当前环境配置
  ...getEnvConfig()
}
