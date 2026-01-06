const envConfig = require('./config/env')

App({
  globalData: {
    baseUrl: envConfig.baseUrl,
    env: envConfig.CURRENT_ENV,
    envName: envConfig.name,
    debug: envConfig.debug,
    userInfo: null
  },
  onLaunch() {
    // 输出环境信息
    console.log('=== 小程序启动 ===')
    console.log('环境:', this.globalData.envName)
    console.log('API地址:', this.globalData.baseUrl)
    console.log('调试模式:', this.globalData.debug)

    // 允许通过本地存储临时覆盖API地址（用于测试）
    const customBaseUrl = wx.getStorageSync('customBaseUrl')
    if (customBaseUrl) {
      console.log('使用自定义API地址:', customBaseUrl)
      this.globalData.baseUrl = customBaseUrl
    }
  },

  // 提供方法让用户在小程序中切换环境（仅用于测试）
  setCustomBaseUrl(url) {
    if (url) {
      wx.setStorageSync('customBaseUrl', url)
      this.globalData.baseUrl = url
      console.log('已设置自定义API地址:', url)
      wx.showToast({
        title: '已切换API地址',
        icon: 'success'
      })
    } else {
      wx.removeStorageSync('customBaseUrl')
      this.globalData.baseUrl = envConfig.baseUrl
      console.log('已恢复默认API地址:', envConfig.baseUrl)
      wx.showToast({
        title: '已恢复默认地址',
        icon: 'success'
      })
    }
  }
})
