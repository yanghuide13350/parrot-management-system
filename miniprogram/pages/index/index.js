const api = require('../../services/api')

Page({
  data: {
    stats: {
      total_parrots: 0,
      available_parrots: 0,
      sold_parrots: 0,
      returned_parrots: 0,
      paired_parrots: 0,
      total_revenue: 0
    },
    breedCounts: [],
    monthlySales: [],
    incubationStats: {
      total_records: 0,
      incubating_count: 0,
      hatched_count: 0,
      failed_count: 0,
      hatch_rate: 0
    },
    loading: true
  },

  onLoad() {
    if (this) {
      this.loadData()
    }
  },

  onShow() {
    if (this) {
      this.loadData()
    }
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadData() {
    if (!this) return
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

      let incubationStats = this.data.incubationStats
      try {
        const incubationRes = await api.getIncubationStatistics()
        if (incubationRes) {
          incubationStats = {
            total_records: incubationRes.total_records || 0,
            incubating_count: incubationRes.incubating_count || 0,
            hatched_count: incubationRes.hatched_count || 0,
            failed_count: incubationRes.failed_count || 0,
            hatch_rate: incubationRes.hatch_rate ? Math.round(incubationRes.hatch_rate * 100) : 0
          }
        }
      } catch (e) {
        console.log('孵化统计加载失败:', e)
      }

      const stats = statsRes || this.data.stats

      this.setData({
        stats,
        breedCounts,
        monthlySales,
        incubationStats,
        loading: false
      })
    } catch (err) {
      console.error('加载数据失败:', err)
      this.setData({ loading: false })
    }
  },

  goToList(e) {
    const status = e.currentTarget.dataset.status
    if (status) {
      wx.reLaunch({ url: `/pages/parrot/list/index?status=${status}` })
    } else {
      wx.reLaunch({ url: '/pages/parrot/list/index?reset=true' })
    }
  },

  goToSales() {
    wx.navigateTo({ url: '/pages/sales/list/index' })
  }
})
