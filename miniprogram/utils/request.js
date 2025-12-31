let requestCount = 0

function showLoading() {
  if (requestCount === 0) {
    wx.showLoading({ title: '加载中', mask: true })
  }
  requestCount++
}

function hideLoading() {
  requestCount--
  if (requestCount <= 0) {
    requestCount = 0
    wx.hideLoading()
  }
}

function request(options) {
  const app = getApp()
  return new Promise((resolve, reject) => {
    // 默认显示 loading，除非明确 set loading: false
    const showLoad = options.loading !== false
    if (showLoad) showLoading()

    wx.request({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (showLoad) hideLoading()

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          // 业务逻辑错误
          handleError(res)
          reject(res.data)
        }
      },
      fail: (err) => {
        if (showLoad) hideLoading()

        // 区分是网络断开还是连接被拒绝
        const errMsg = err.errMsg || ''
        if (errMsg.includes('request:fail')) {
          wx.showToast({ title: '无法连接服务器', icon: 'none' })
        } else {
          wx.showToast({ title: '网络请求失败', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}

function handleError(res) {
  const msg = res.data?.detail || res.data?.message || '操作失败'
  if (res.statusCode === 404) {
    // 某些查询为空可能不视为错误，视业务而定，这里保持提示
    // wx.showToast({ title: '数据不存在', icon: 'none' })
  }
  else if (res.statusCode === 400) wx.showToast({ title: msg, icon: 'none' })
  else if (res.statusCode === 422) wx.showToast({ title: '参数验证失败', icon: 'none' })
  else if (res.statusCode >= 500) wx.showToast({ title: '服务器错误', icon: 'none' })
  else wx.showToast({ title: msg, icon: 'none' })
}

function uploadFile(url, filePath, name = 'file') {
  const app = getApp()
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中', mask: true })
    wx.uploadFile({
      url: app.globalData.baseUrl + url,
      filePath,
      name,
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(res.data))
        } else {
          wx.showToast({ title: '上传失败', icon: 'none' })
          reject(res)
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = { request, uploadFile }
