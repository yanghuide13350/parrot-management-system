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
    if (this) {
      this.loadStats()
      this.loadData()
    }
  },
  onShow() {
    // Native tab bar handles selection automatically
  },
  onPullDownRefresh() {
    this.setData({ page: 1 })
    Promise.all([this.loadStats(), this.loadData()]).then(() => wx.stopPullDownRefresh())
  },
  async loadStats() {
    if (!this) return
    try {
      const [sales, returns] = await Promise.all([
        api.getSalesStatistics(),
        api.getReturnsStatistics()
      ])
      this.setData({
        stats: {
          total: sales.total_sales || 0,
          revenue: sales.total_revenue || 0,
          returnRate: returns.return_rate ? (returns.return_rate * 100).toFixed(1) : 0
        }
      })
    } catch (e) { }
  },
  async loadData(append = false) {
    if (!this) return
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const params = {
        page: this.data.page, // Use page, not skip
        size: this.data.pageSize // Use size, not limit
      }
      if (this.data.keyword) {
        params.keyword = this.data.keyword
      }
      const res = await api.getSalesRecords(params)
      // Flatten the structure: backend returns nested parrot object
      const list = (res.items || []).map(item => ({
        ...item,
        breed: item.parrot ? item.parrot.breed : '',
        gender: item.parrot ? item.parrot.gender : '',
        ring_number: item.parrot ? item.parrot.ring_number : '',
        photo_url: item.photo_url ? `http://127.0.0.1:8000${item.photo_url}` : '',
        followUpText: FOLLOW_UP_STATUS[item.follow_up_status] || '待回访',
        soldDate: formatDate(item.sale_date, 'MM-DD')
      }))
      this.setData({
        list: append ? [...this.data.list, ...list] : list,
        hasMore: list.length === this.data.pageSize,
        loading: false
      })
    } catch (e) {
      console.error('加载销售记录失败:', e)
      wx.showToast({ title: '加载失败: ' + e.message, icon: 'none' })
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
