function request(options) {
  const app = getApp()
  return new Promise((resolve, reject) => {
    if (options.loading !== false) wx.showLoading({ title: '加载中' })
    wx.request({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          handleError(res)
          reject(res.data)
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

function handleError(res) {
  const msg = res.data?.detail || '操作失败'
  if (res.statusCode === 404) wx.showToast({ title: '数据不存在', icon: 'none' })
  else if (res.statusCode === 400) wx.showToast({ title: msg, icon: 'none' })
  else if (res.statusCode >= 500) wx.showToast({ title: '服务器错误', icon: 'none' })
  else wx.showToast({ title: msg, icon: 'none' })
}

function uploadFile(url, filePath, name = 'file') {
  const app = getApp()
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中' })
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
