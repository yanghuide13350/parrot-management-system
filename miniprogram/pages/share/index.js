const api = require('../../services/api')
const { STATUS_MAP } = require('../../utils/constants')
const { calcAge } = require('../../utils/date')

Page({
  data: {
    parrot: null,
    photos: [],
    loading: true,
    error: false
  },
  onLoad(options) {
    if (this) {
      if (options.token) {
        this.loadShareInfo(options.token)
      } else if (options.id) {
        this.loadParrot(options.id)
      }
    }
  },
  async loadShareInfo(token) {
    if (!this) return
    try {
      const data = await api.getShareInfo(token)
      if (data.status !== 'valid') {
        this.setData({ loading: false, error: true })
        return
      }
      // 构建完整的图片URL
      const photosWithUrl = (data.photos || []).map(p => ({
        ...p,
        url: `http://127.0.0.1:8000/uploads/${p.file_path}`
      }))
      this.setData({
        parrot: {
          ...data.parrot,
          statusText: STATUS_MAP[data.parrot.status],
          age: calcAge(data.parrot.birth_date),
          priceText: this.formatPrice(data.parrot)
        },
        photos: photosWithUrl,
        loading: false
      })
    } catch (e) {
      console.error('加载分享信息失败:', e)
      this.setData({ loading: false, error: true })
    }
  },
  async loadParrot(id) {
    if (!this) return
    try {
      const [parrot, photos] = await Promise.all([
        api.getParrot(id),
        api.getPhotos(id).catch(() => [])
      ])
      this.setData({
        parrot: {
          ...parrot,
          statusText: STATUS_MAP[parrot.status],
          age: calcAge(parrot.birth_date),
          priceText: this.formatPrice(parrot)
        },
        photos,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false, error: true })
    }
  },
  formatPrice(p) {
    if (p.price) return `¥${p.price}`
    if (p.min_price && p.max_price) return `¥${p.min_price}-${p.max_price}`
    if (p.min_price) return `¥${p.min_price}起`
    return '面议'
  },
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    // 只预览图片，不包含视频
    const imageUrls = this.data.photos
      .filter(p => p.file_type !== 'video')
      .map(p => p.url)
    if (imageUrls.length > 0) {
      wx.previewImage({ current: url, urls: imageUrls })
    }
  },
  onShareAppMessage() {
    const { parrot } = this.data
    return {
      title: `${parrot.breed} - ${parrot.gender}`,
      path: `/pages/share/index?id=${parrot.id}`
    }
  }
})
