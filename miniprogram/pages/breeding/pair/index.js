const api = require('../../../services/api')

Page({
  data: {
    maleId: null,
    females: [],
    loading: false
  },
  onLoad(options) {
    this.setData({ maleId: options.id })
    this.loadFemales()
  },
  async loadFemales() {
    this.setData({ loading: true })
    try {
      const females = await api.getEligibleFemales(this.data.maleId)
      this.setData({ females, loading: false })
    } catch (e) {
      this.setData({ loading: false })
    }
  },
  selectFemale(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认配对',
      content: '确定要配对这两只鹦鹉吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.pairParrots({ male_id: Number(this.data.maleId), female_id: id })
            wx.showToast({ title: '配对成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          } catch (e) { }
        }
      }
    })
  }
})
