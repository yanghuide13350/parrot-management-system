const api = require('../../services/api')

Page({
  data: {
    stats: {
      total_parrots: 0,
      available_parrots: 0,
      sold_parrots: 0,
      returned_parrots: 0,
      total_revenue: 0
    },
    breedCounts: [],
    monthlySales: [],
    loading: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const [statsRes, monthlyRes] = await Promise.all([
        api.getStatistics().catch(() => null),
        api.getMonthlySales().catch(() => null)
      ])

      const breedCounts = []
      let maxBreed = 1
      if (statsRes && statsRes.breed_counts) {
        for (const name in statsRes.breed_counts) {
          const count = statsRes.breed_counts[name]
          breedCounts.push({ name, count })
          if (count > maxBreed) maxBreed = count
        }
        breedCounts.forEach(item => {
          item.percent = Math.round((item.count / maxBreed) * 100)
        })
      }

      let monthlySales = []
      const salesData = monthlyRes?.monthly_sales || monthlyRes || []
      if (salesData.length) {
        monthlySales = salesData.map(item => ({
          month: item.month,
          count: item.count || 0,
          amount: item.revenue || item.amount || 0
        }))
      }

      this.setData({
        stats: statsRes || this.data.stats,
        breedCounts,
        monthlySales,
        loading: false
      })
    } catch (err) {
      console.error('加载数据失败:', err)
      this.setData({ loading: false })
    }
  },

  goToList() {
    wx.switchTab({ url: '/pages/parrot/list/index' })
  },

  goToBreed() {
    wx.switchTab({ url: '/pages/parrot/list/index' })
  }
})
