const api = require('../../../services/api')

Page({
  data: {
    parrotId: null,
    parrotGender: null,
    mates: [],
    loading: false,
    isMale: true
  },
  onLoad(options) {
    if (this) {
      this.setData({ parrotId: options.id })
      this.loadData()
    }
  },
  async loadData() {
    if (!this) return
    this.setData({ loading: true })
    try {
      const parrot = await api.getParrot(this.data.parrotId)
      const isMale = parrot.gender === '公'
      this.setData({ parrotGender: parrot.gender, isMale })

      let mates = []
      if (isMale) {
        mates = await api.getEligibleFemales(this.data.parrotId)
      } else {
        mates = await api.getEligibleMales(this.data.parrotId)
      }

      this.setData({ mates, loading: false })
    } catch (e) {
      this.setData({ loading: false })
    }
  },
  selectMate(e) {
    const { id } = e.currentTarget.dataset
    const isMale = this.data.isMale

    wx.showModal({
      title: '确认配对',
      content: '确定要配对这两只鹦鹉吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            if (isMale) {
              await api.pairParrots({ male_id: Number(this.data.parrotId), female_id: id })
            } else {
              await api.pairParrots({ male_id: id, female_id: Number(this.data.parrotId) })
            }
            wx.showToast({ title: '配对成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          } catch (e) { }
        }
      }
    })
  }
})
