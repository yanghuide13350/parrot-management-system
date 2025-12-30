App({
  globalData: {
    baseUrl: 'http://127.0.0.1:8000/api',
    userInfo: null
  },
  onLaunch() {
    const baseUrl = wx.getStorageSync('baseUrl')
    if (baseUrl) this.globalData.baseUrl = baseUrl
  }
})
