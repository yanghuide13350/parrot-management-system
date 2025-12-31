const api = require('../../../services/api')
const { INCUBATION_STATUS } = require('../../../utils/constants')
const { formatDate } = require('../../../utils/date')

Page({
  data: {
    list: [],
    loading: false,
    showFilter: false,
    filters: {
      status: 'all',
      startDateFrom: '',
      startDateTo: '',
      search: ''
    },
    statusList: [
      { value: 'all', label: '全部状态' },
      { value: 'incubating', label: '孵化中' },
      { value: 'hatched', label: '已孵化' },
      { value: 'failed', label: '失败' }
    ],
    statusLabel: '全部状态'
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
    this.loadData().then(() => wx.stopPullDownRefresh())
  },
  async loadData() {
    if (!this) return
    this.setData({ loading: true })
    try {
      const params = {}
      const { filters } = this.data

      if (filters.status !== 'all') params.status = filters.status
      if (filters.startDateFrom) params.start_date_from = filters.startDateFrom
      if (filters.startDateTo) params.start_date_to = filters.startDateTo
      if (filters.search) {
        params.father_ring_number = filters.search
        params.mother_ring_number = filters.search
      }

      const res = await api.getIncubationRecords(params)
      const data = Array.isArray(res) ? res : (res.items || [])

      const list = data.map(r => {
        const startDate = new Date(r.start_date)
        const today = new Date()
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))

        let hatchRate = ''
        if (r.status === 'hatched' && r.eggs_count > 0) {
          hatchRate = Math.round((r.hatched_count / r.eggs_count) * 100) + '%'
        }

        return {
          ...r,
          statusText: INCUBATION_STATUS[r.status],
          startDateText: formatDate(r.start_date, 'MM-DD'),
          incubationDays: r.status === 'incubating' ? `${daysDiff}天` : '',
          hatchRate
        }
      })

      this.setData({
        list,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },
  onStatusChange(e) {
    const index = e.detail.value
    const status = this.data.statusList[index]
    this.setData({
      'filters.status': status.value,
      statusLabel: status.label
    })
  },
  onStartDateFromChange(e) {
    this.setData({
      'filters.startDateFrom': e.detail.value
    })
  },
  onStartDateToChange(e) {
    this.setData({
      'filters.startDateTo': e.detail.value
    })
  },
  onSearchInput(e) {
    this.setData({
      'filters.search': e.detail.value
    })
  },
  applyFilter() {
    this.loadData()
    this.setData({ showFilter: false })
  },
  resetFilter() {
    this.setData({
      filters: {
        status: 'all',
        startDateFrom: '',
        startDateTo: '',
        search: ''
      },
      statusLabel: '全部状态'
    })
    this.loadData()
  },
  goAdd() {
    wx.navigateTo({ url: '/pages/incubation/add/index' })
  },
  goEdit(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/incubation/add/index?id=${id}` })
  }
})
