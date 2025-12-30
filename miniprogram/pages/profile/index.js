const { clearCache } = require('../../utils/storage')

Page({
  data: {
    showSettingsModal: false,
    baseUrl: ''
  },
  onLoad() {
    const app = getApp()
    this.setData({ baseUrl: app.globalData.baseUrl })
  },
  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 3 })
    }
  },
  goBreeding() {
    wx.navigateTo({ url: '/pages/breeding/list/index' })
  },
  goIncubation() {
    wx.navigateTo({ url: '/pages/incubation/list/index' })
  },
  showSettings() {
    this.setData({ showSettingsModal: true })
  },
  hideSettings() {
    this.setData({ showSettingsModal: false })
  },
  onBaseUrlInput(e) {
    this.setData({ baseUrl: e.detail.value })
  },
  saveSettings() {
    const app = getApp()
    app.globalData.baseUrl = this.data.baseUrl
    wx.setStorageSync('baseUrl', this.data.baseUrl)
    wx.showToast({ title: '保存成功', icon: 'success' })
    this.setData({ showSettingsModal: false })
  },
  clearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          clearCache()
          wx.showToast({ title: '清除成功', icon: 'success' })
        }
      }
    })
  }
})
