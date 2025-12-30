const api = require('../../../services/api')
const { FOLLOW_UP_STATUS } = require('../../../utils/constants')
const { formatDate } = require('../../../utils/date')

Page({
  data: {
    list: [],
    stats: { total: 0, revenue: 0, returnRate: 0 },
    keyword: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },
  onLoad() {
    this.loadStats()
    this.loadData()
  },
  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 2 })
    }
  },
  onPullDownRefresh() {
    this.setData({ page: 1 })
    Promise.all([this.loadStats(), this.loadData()]).then(() => wx.stopPullDownRefresh())
  },
  async loadStats() {
    try {
      const [sales, returns] = await Promise.all([
        api.getSalesStatistics(),
        api.getReturnsStatistics()
      ])
      this.setData({
        stats: {
          total: sales.total_sold || 0,
          revenue: sales.total_revenue || 0,
          returnRate: returns.return_rate ? (returns.return_rate * 100).toFixed(1) : 0
        }
      })
    } catch (e) { }
  },
  async loadData(append = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const params = {
        skip: (this.data.page - 1) * this.data.pageSize,
        limit: this.data.pageSize,
        search: this.data.keyword || undefined
      }
      const res = await api.getSalesRecords(params)
      const list = res.map(item => ({
        ...item,
        followUpText: FOLLOW_UP_STATUS[item.follow_up_status] || '待回访',
        soldDate: formatDate(item.sold_at, 'MM-DD')
      }))
      this.setData({
        list: append ? [...this.data.list, ...list] : list,
        hasMore: res.length === this.data.pageSize,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadData(true)
  },
  onSearch(e) {
    this.setData({ keyword: e.detail.value, page: 1 })
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => this.loadData(), 300)
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/parrot/detail/index?id=${id}` })
  }
})
