Component({
  properties: {
    value: { type: String, value: '0' },
    label: { type: String, value: '' },
    iconClass: { type: String, value: '' },
    link: { type: String, value: '' }
  },
  methods: {
    onTap() {
      if (this.data.link) {
        wx.navigateTo({ url: this.data.link })
      }
      this.triggerEvent('tap')
    }
  }
})
