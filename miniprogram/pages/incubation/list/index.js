const api = require('../../../services/api')
const { INCUBATION_STATUS } = require('../../../utils/constants')
const { formatDate } = require('../../../utils/date')

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
      const res = await api.getIncubationRecords({})
      this.setData({
        list: res.map(r => ({
          ...r,
          statusText: INCUBATION_STATUS[r.status],
          startDateText: formatDate(r.start_date, 'MM-DD')
        })),
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },
  goAdd() {
    wx.navigateTo({ url: '/pages/incubation/add/index' })
  },
  goEdit(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/incubation/add/index?id=${id}` })
  }
})
