const api = require('../../../services/api')
const { STATUS_MAP } = require('../../../utils/constants')

Page({
  data: {
    list: [],
    loading: false
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },
  async loadData() {
    this.setData({ loading: true })
    try {
      const res = await api.getParrots({ status: 'breeding,paired,incubating' })
      this.setData({
        list: res.map(p => ({
          ...p,
          statusText: STATUS_MAP[p.status]
        })),
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/parrot/detail/index?id=${id}` })
  },
  goPair(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/breeding/pair/index?id=${id}` })
  }
})
