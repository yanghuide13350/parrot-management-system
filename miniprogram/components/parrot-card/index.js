const { STATUS_MAP } = require('../../utils/constants')

Component({
  properties: {
    parrot: { type: Object, value: {} }
  },
  computed: {},
  observers: {
    'parrot': function (p) {
      if (!p) return
      this.setData({
        statusText: STATUS_MAP[p.status] || p.status,
        priceText: this.formatPrice(p)
      })
    }
  },
  data: {
    statusText: '',
    priceText: ''
  },
  lifetimes: {
    attached() {
      const p = this.data.parrot
      if (p) {
        this.setData({
          statusText: STATUS_MAP[p.status] || p.status,
          priceText: this.formatPrice(p)
        })
      }
    }
  },
  methods: {
    formatPrice(p) {
      if (p.price) return `¥${p.price}`
      if (p.min_price && p.max_price) return `¥${p.min_price}-${p.max_price}`
      if (p.min_price) return `¥${p.min_price}起`
      if (p.max_price) return `≤${p.max_price}`
      return ''
    },
    onImageError(e) {
      console.error('图片加载失败:', this.data.parrot.photo_url, e.detail)
      // 可以在这里设置一个标志来显示占位图
    },
    onImageLoad(e) {
      console.log('图片加载成功:', this.data.parrot.photo_url)
    },
    onTap() {
      this.triggerEvent('tap', { parrot: this.data.parrot })
    }
  }
})
