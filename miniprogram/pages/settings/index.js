const envConfig = require('../../config/env')

Page({
  data: {
    currentEnv: '',
    currentBaseUrl: '',
    customBaseUrl: '',
    envList: [
      { name: '开发环境', value: 'http://localhost:8000/api' },
      { name: '测试环境', value: 'http://103.110.81.83/api' },
      { name: '生产环境', value: 'https://yourdomain.com/api' }
    ]
  },

  onLoad() {
    const app = getApp()
    this.setData({
      currentEnv: app.globalData.envName,
      currentBaseUrl: app.globalData.baseUrl,
      customBaseUrl: wx.getStorageSync('customBaseUrl') || ''
    })
  },

  onShow() {
    const app = getApp()
    this.setData({
      currentBaseUrl: app.globalData.baseUrl
    })
  },

  // 选择预设环境
  onEnvTap(e) {
    const url = e.currentTarget.dataset.url
    const name = e.currentTarget.dataset.name

    wx.showModal({
      title: '切换环境',
      content: `确定切换到${name}吗？\n${url}`,
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.setCustomBaseUrl(url)
          this.setData({
            currentBaseUrl: url,
            customBaseUrl: url
          })
        }
      }
    })
  },

  // 输入自定义地址
  onInputChange(e) {
    this.setData({
      customBaseUrl: e.detail.value
    })
  },

  // 应用自定义地址
  onApplyCustomUrl() {
    const url = this.data.customBaseUrl.trim()

    if (!url) {
      wx.showToast({
        title: '请输入API地址',
        icon: 'none'
      })
      return
    }

    // 简单验证URL格式
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      wx.showToast({
        title: 'URL格式错误',
        icon: 'none'
      })
      return
    }

    const app = getApp()
    app.setCustomBaseUrl(url)
    this.setData({
      currentBaseUrl: url
    })
  },

  // 恢复默认配置
  onResetToDefault() {
    wx.showModal({
      title: '恢复默认',
      content: `确定恢复到默认配置吗？\n${envConfig.baseUrl}`,
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.setCustomBaseUrl(null)
          this.setData({
            currentBaseUrl: envConfig.baseUrl,
            customBaseUrl: ''
          })
        }
      }
    })
  },

  // 测试连接
  onTestConnection() {
    wx.showLoading({ title: '测试连接中...' })

    const app = getApp()
    wx.request({
      url: app.globalData.baseUrl.replace('/api', '') + '/api/statistics',
      method: 'GET',
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          wx.showModal({
            title: '连接成功',
            content: `API地址可以正常访问\n${app.globalData.baseUrl}`,
            showCancel: false
          })
        } else {
          wx.showModal({
            title: '连接失败',
            content: `状态码: ${res.statusCode}\n${app.globalData.baseUrl}`,
            showCancel: false
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showModal({
          title: '连接失败',
          content: `无法连接到服务器\n${err.errMsg}`,
          showCancel: false
        })
      }
    })
  },

  // 复制当前地址
  onCopyUrl() {
    wx.setClipboardData({
      data: this.data.currentBaseUrl,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }
})
