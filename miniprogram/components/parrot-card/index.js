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
      if (p.max_price) return `≤¥${p.max_price}`
      return ''
    },
    onTap() {
      this.triggerEvent('tap', { parrot: this.data.parrot })
    }
  }
})
