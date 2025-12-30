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
    if (options.token) {
      this.loadShareInfo(options.token)
    } else if (options.id) {
      this.loadParrot(options.id)
    }
  },
  async loadShareInfo(token) {
    try {
      const data = await api.getShareInfo(token)
      this.setData({
        parrot: {
          ...data.parrot,
          statusText: STATUS_MAP[data.parrot.status],
          age: calcAge(data.parrot.birth_date),
          priceText: this.formatPrice(data.parrot)
        },
        photos: data.photos || [],
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false, error: true })
    }
  },
  async loadParrot(id) {
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
    wx.previewImage({ current: url, urls: this.data.photos.map(p => p.url) })
  },
  onShareAppMessage() {
    const { parrot } = this.data
    return {
      title: `${parrot.breed} - ${parrot.gender}`,
      path: `/pages/share/index?id=${parrot.id}`
    }
  }
})
