const api = require('../../../services/api')

Page({
  data: {
    list: [],
    leftList: [],
    rightList: [],
    keyword: '',
    filters: {},
    filterCount: 0,
    breeds: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    refreshing: false,
    showFilterDrawer: false
  },
  onLoad(options) {
    if (options.status) this.setData({ filters: { status: options.status } })
    if (options.breed) this.setData({ filters: { breed: options.breed } })
    this.updateFilterCount()
    this.loadBreeds()
    this.loadData()
  },
  onShow() {
    // 刷新数据
    if (this.data.list.length > 0) {
      this.loadData()
    }
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  async loadBreeds() {
    try {
      const stats = await api.getStatistics()
      if (stats.breed_counts) {
        this.setData({ breeds: Object.keys(stats.breed_counts) })
      }
    } catch (e) { }
  },
  async loadData(append = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const params = {
        skip: (this.data.page - 1) * this.data.pageSize,
        limit: this.data.pageSize,
        search: this.data.keyword || undefined,
        ...this.data.filters
      }
      Object.keys(params).forEach(k => params[k] === undefined && delete params[k])
      const res = await api.getParrots(params)
      const items = res.items || res || []
      const list = append ? [...this.data.list, ...items] : items
      this.setData({
        list,
        hasMore: items.length === this.data.pageSize,
        loading: false,
        refreshing: false
      })
      this.splitList(list)
    } catch (e) {
      console.error('加载列表失败:', e)
      this.setData({ loading: false, refreshing: false })
    }
  },
  splitList(list) {
    const left = [], right = []
    list.forEach((item, i) => (i % 2 === 0 ? left : right).push(item))
    this.setData({ leftList: left, rightList: right })
  },
  onRefresh() {
    this.setData({ page: 1, refreshing: true })
    this.loadData()
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
  showFilter() {
    this.setData({ showFilterDrawer: true })
  },
  hideFilter() {
    this.setData({ showFilterDrawer: false })
  },
  onFilterConfirm(e) {
    this.setData({
      filters: e.detail.filters,
      showFilterDrawer: false,
      page: 1
    })
    this.updateFilterCount()
    this.loadData()
  },
  updateFilterCount() {
    const count = Object.values(this.data.filters).filter(v => v).length
    this.setData({ filterCount: count })
  },
  goDetail(e) {
    const parrot = e.detail?.parrot || e.currentTarget?.dataset?.parrot
    if (parrot && parrot.id) {
      wx.navigateTo({ url: `/pages/parrot/detail/index?id=${parrot.id}` })
    }
  },
  goAdd() {
    wx.navigateTo({ url: '/pages/parrot/add/index' })
  }
})
