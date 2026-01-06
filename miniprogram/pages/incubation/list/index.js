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
      { value: 'completed', label: '已完成' },
      { value: 'failed', label: '失败' }
    ],
    statusLabel: '全部状态',
    showUpdateDialog: false,
    updateRecordId: null,
    updateHatchedCount: '',
    remainingEggs: 0,
    totalEggs: 0,
    currentHatchedCount: 0
  },
  onLoad() {
    if (this) {
      this.loadData()
    }
  },
  onShow() {
    this.loadData()
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
  },
  showUpdateDialog(e) {
    const { id, eggs, hatched } = e.currentTarget.dataset
    const eggsNum = Number(eggs) || 0
    const hatchedNum = Number(hatched) || 0
    const remaining = eggsNum - hatchedNum
    console.log('showUpdateDialog:', { eggs, hatched, eggsNum, hatchedNum, remaining })
    this.setData({
      updateRecordId: id,
      totalEggs: eggsNum,
      currentHatchedCount: hatchedNum,
      updateHatchedCount: '',
      remainingEggs: remaining
    })
    if (remaining === 0) {
      this.confirmCompleteIncubation()
    } else {
      this.setData({ showUpdateDialog: true })
    }
  },
  hideUpdateDialog() {
    this.setData({
      showUpdateDialog: false,
      updateRecordId: null,
      updateHatchedCount: '',
      remainingEggs: 0,
      totalEggs: 0,
      currentHatchedCount: 0
    })
  },
  onUpdateHatchedInput(e) {
    const inputVal = e.detail.value
    let count = Number(inputVal) || 0
    const maxCount = this.data.remainingEggs
    if (count > maxCount) {
      count = maxCount
    }
    const remaining = this.data.totalEggs - this.data.currentHatchedCount - count
    console.log('onUpdateHatchedInput:', { inputVal, count, remaining, totalEggs: this.data.totalEggs, currentHatched: this.data.currentHatchedCount, maxCount })
    this.setData({
      updateHatchedCount: String(count),
      remainingEggs: Math.max(0, remaining)
    })
  },
  async confirmUpdate() {
    const { updateRecordId, updateHatchedCount, currentHatchedCount, totalEggs } = this.data
    console.log('confirmUpdate:', { updateRecordId, updateHatchedCount, currentHatchedCount, totalEggs })
    if (!updateHatchedCount || Number(updateHatchedCount) <= 0) {
      return wx.showToast({ title: '请输入正确的孵化数量', icon: 'none' })
    }

    const newHatchedCount = currentHatchedCount + Number(updateHatchedCount)
    console.log('newHatchedCount:', newHatchedCount)
    if (newHatchedCount > totalEggs) {
      return wx.showToast({ title: '孵化数量不能超过蛋数', icon: 'none' })
    }

    wx.showLoading({ title: '更新中...' })
    try {
      const data = {
        hatched_count: newHatchedCount
      }

      if (newHatchedCount === totalEggs) {
        data.status = 'hatched'
        data.actual_hatch_date = new Date().toISOString().split('T')[0]
      }

      await api.updateIncubation(updateRecordId, data)

      wx.hideLoading()
      wx.showToast({ title: '更新成功', icon: 'success' })
      this.hideUpdateDialog()
      this.loadData()
    } catch (err) {
      wx.hideLoading()
      console.error('更新孵化记录失败:', err)
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  },
  async completeIncubation() {
    const { updateRecordId } = this.data
    wx.showLoading({ title: '处理中...' })
    try {
      const record = this.data.list.find(r => r.id === updateRecordId)
      if (!record) {
        wx.hideLoading()
        return wx.showToast({ title: '记录不存在', icon: 'none' })
      }
      if (record.status === 'completed' || record.status === 'hatched') {
        wx.hideLoading()
        return wx.showToast({ title: '该记录已完成', icon: 'none' })
      }
      await api.updateIncubation(updateRecordId, { status: 'completed' })
      try {
        await api.updateParrotStatus(record.father_id, { status: 'paired' })
        await api.updateParrotStatus(record.mother_id, { status: 'paired' })
      } catch (statusErr) {
        console.error('更新鹦鹉状态失败:', statusErr)
      }

      wx.hideLoading()
      wx.showToast({ title: '已完成，父母鸟已设为配对中', icon: 'success' })
      this.hideUpdateDialog()
      this.loadData()
    } catch (err) {
      wx.hideLoading()
      console.error('完成孵化操作失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },
  confirmCompleteIncubation() {
    const { updateRecordId, list } = this.data
    wx.showModal({
      title: '确认完成',
      content: '是否完成本次孵化？完成后父母鸟将变为配对中状态',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          try {
            const record = list.find(r => r.id === updateRecordId)
            if (!record) {
              wx.hideLoading()
              return wx.showToast({ title: '记录不存在', icon: 'none' })
            }
            if (record.status === 'completed') {
              wx.hideLoading()
              return wx.showToast({ title: '该记录已完成', icon: 'none' })
            }
            await api.updateIncubation(updateRecordId, { status: 'completed' })
            try {
              await api.updateParrotStatus(record.father_id, { status: 'paired' })
              await api.updateParrotStatus(record.mother_id, { status: 'paired' })
            } catch (statusErr) {
              console.error('更新鹦鹉状态失败:', statusErr)
            }
            wx.hideLoading()
            wx.showToast({ title: '已完成，父母鸟已设为配对中', icon: 'success' })
            this.hideUpdateDialog()
            this.loadData()
          } catch (err) {
            wx.hideLoading()
            console.error('完成孵化操作失败:', err)
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },
  deleteRecord(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条孵化记录吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          try {
            await api.deleteIncubation(id)

            wx.hideLoading()
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadData()
          } catch (err) {
            wx.hideLoading()
            console.error('删除孵化记录失败:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
