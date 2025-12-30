App({
  globalData: {
    baseUrl: 'http://127.0.0.1:8000/api',
    userInfo: null
  },
  onLaunch() {
    const baseUrl = wx.getStorageSync('baseUrl')
    if (baseUrl) {
      // 只有当存储的地址是正确的时候才使用
      if (baseUrl.includes(':8000/')) {
        this.globalData.baseUrl = baseUrl
      } else {
        // 清除错误的地址
        wx.removeStorageSync('baseUrl')
      }
    }
  }
})
