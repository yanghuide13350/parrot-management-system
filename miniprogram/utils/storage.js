const CACHE_DURATION = 5 * 60 * 1000

function setCache(key, data) {
  wx.setStorageSync(key, { data, timestamp: Date.now() })
}

function getCache(key) {
  const cache = wx.getStorageSync(key)
  if (!cache) return null
  if (Date.now() - cache.timestamp > CACHE_DURATION) {
    wx.removeStorageSync(key)
    return null
  }
  return cache.data
}

function clearCache(key) {
  if (key) wx.removeStorageSync(key)
  else wx.clearStorageSync()
}

module.exports = { setCache, getCache, clearCache, CACHE_DURATION }
