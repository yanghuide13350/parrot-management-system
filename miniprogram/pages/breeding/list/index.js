const api = require('../../../services/api')
const { STATUS_MAP } = require('../../../utils/constants')

Page({
  data: {
    list: [],
    loading: false,
    showFilter: false,
    filters: {
      pairingStatus: 'all',
      breed: 'all',
      gender: 'all',
      search: ''
    },
    showIncubationDialog: false,
    incubationEggsCount: '',
    incubationParrotId: null,
    pairingStatusList: [
      { value: 'all', label: '全部' },
      { value: 'unpaired', label: '未配对' },
      { value: 'paired', label: '已配对' },
      { value: 'incubating', label: '孵化中' }
    ],
    breedList: [
      { value: 'all', label: '全部品种' },
      { value: '虎皮', label: '虎皮' },
      { value: '玄凤', label: '玄凤' },
      { value: '牡丹', label: '牡丹' },
      { value: '小太阳', label: '小太阳' },
      { value: '和尚', label: '和尚' },
      { value: '凯克', label: '凯克' }
    ],
    genderList: [
      { value: 'all', label: '全部性别' },
      { value: '公', label: '公' },
      { value: '母', label: '母' },
      { value: '未验卡', label: '未验卡' }
    ],
    pairingStatusLabel: '全部',
    breedLabel: '全部品种',
    genderLabel: '全部性别'
  },
  onLoad() {
    if (this) {
      this.loadData()
    }
  },
  onShow() {
    // 只在有数据时刷新，避免重复加载
    if (this && this.data.list && this.data.list.length > 0) {
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
      const { filters } = this.data

      const params = {}
      if (filters.breed !== 'all') params.breed = filters.breed
      if (filters.gender !== 'all') params.gender = filters.gender
      if (filters.search) params.keyword = filters.search

      let res = []
      if (filters.pairingStatus === 'all') {
        const [breeding, paired, incubating] = await Promise.all([
          api.getParrots({ ...params, status: 'breeding', include_mate: true }),
          api.getParrots({ ...params, status: 'paired', include_mate: true }),
          api.getParrots({ ...params, status: 'incubating', include_mate: true })
        ])
        res = [
          ...(Array.isArray(breeding) ? breeding : breeding.items || []),
          ...(Array.isArray(paired) ? paired : paired.items || []),
          ...(Array.isArray(incubating) ? incubating : incubating.items || [])
        ]
      } else {
        const data = await api.getParrots({ ...params, status: filters.pairingStatus, include_mate: true })
        res = Array.isArray(data) ? data : (data.items || [])
      }

      console.log('获取到的鹦鹉数据:', res)
      console.log('鹦鹉数量:', res.length)

      const listWithMate = []
      for (const p of res) {
        let mateInfo = null
        if (p.mate) {
          mateInfo = {
            has_mate: true,
            mate: p.mate,
            paired_at: p.paired_at
          }
        } else {
          mateInfo = { has_mate: false, mate: null, paired_at: null }
        }

        let pairingDuration = ''
        if (mateInfo.has_mate && mateInfo.paired_at) {
          const days = Math.floor((Date.now() - new Date(mateInfo.paired_at).getTime()) / (1000 * 60 * 60 * 24))
          pairingDuration = `配对 ${days} 天`
        }

        // 根据是否有配偶动态调整显示状态，与Web端一致
        let displayStatus = p.status
        if (mateInfo.has_mate) {
          displayStatus = 'paired'
        } else if (p.status === 'incubating') {
          displayStatus = 'incubating'
        } else {
          displayStatus = 'breeding'
        }

        listWithMate.push({
          ...p,
          statusText: STATUS_MAP[displayStatus] || displayStatus,
          mateInfo: mateInfo.has_mate ? mateInfo.mate : null,
          pairingDuration,
          isPaired: mateInfo.has_mate
        })
      }

      console.log('处理后的列表数据:', listWithMate)
      console.log('列表数量:', listWithMate.length)

      this.setData({
        list: listWithMate,
        loading: false
      })
    } catch (e) {
      console.error('加载数据失败:', e)
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
  },
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },
  onPairingStatusChange(e) {
    const index = e.detail.value
    const status = this.data.pairingStatusList[index]
    this.setData({
      'filters.pairingStatus': status.value,
      pairingStatusLabel: status.label
    })
  },
  onBreedChange(e) {
    const index = e.detail.value
    const breed = this.data.breedList[index]
    this.setData({
      'filters.breed': breed.value,
      breedLabel: breed.label
    })
  },
  onGenderChange(e) {
    const index = e.detail.value
    const gender = this.data.genderList[index]
    this.setData({
      'filters.gender': gender.value,
      genderLabel: gender.label
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
        pairingStatus: 'all',
        breed: 'all',
        gender: 'all',
        search: ''
      },
      pairingStatusLabel: '全部',
      breedLabel: '全部品种',
      genderLabel: '全部性别'
    })
    this.loadData()
  },
  async unpairParrot(e) {
    const { id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认取消配对',
      content: '确定要取消这个配对吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            console.log('开始取消配对，ID:', id)
            await api.unpairParrot(id)
            console.log('取消配对成功')
            wx.showToast({ title: '取消配对成功', icon: 'success' })
            this.loadData()
          } catch (err) {
            console.error('取消配对失败:', err)
            const msg = err?.detail || err?.message || '操作失败'
            wx.showToast({ title: msg, icon: 'none' })
          }
        }
      }
    })
  },
  goIncubation(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/incubation/add/index?father_id=${id}` })
  },
  goIncubationList(e) {
    wx.navigateTo({ url: '/pages/incubation/list/index' })
  },
  showIncubationDialog(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      showIncubationDialog: true,
      incubationParrotId: id,
      incubationEggsCount: ''
    })
  },
  hideIncubationDialog() {
    this.setData({
      showIncubationDialog: false,
      incubationEggsCount: '',
      incubationParrotId: null
    })
  },
  onIncubationEggsInput(e) {
    this.setData({
      incubationEggsCount: e.detail.value
    })
  },
  async confirmIncubation() {
    const { incubationParrotId, incubationEggsCount } = this.data

    if (!incubationEggsCount) {
      return wx.showToast({ title: '请输入蛋数', icon: 'none' })
    }

    try {
      const mateInfo = await api.getMate(incubationParrotId)
      if (!mateInfo.has_mate) {
        return wx.showToast({ title: '该鹦鹉未配对', icon: 'none' })
      }

      const fatherId = mateInfo.mate.gender === '公' ? mateInfo.mate.id : incubationParrotId
      const motherId = mateInfo.mate.gender === '母' ? mateInfo.mate.id : incubationParrotId

      const startDate = new Date().toISOString().split('T')[0]
      const expectedDate = new Date(startDate)
      expectedDate.setDate(expectedDate.getDate() + 21)
      const expectedDateStr = expectedDate.toISOString().split('T')[0]

      await api.createIncubation({
        father_id: fatherId,
        mother_id: motherId,
        start_date: startDate,
        expected_hatch_date: expectedDateStr,
        eggs_count: Number(incubationEggsCount),
        status: 'incubating'
      })

      wx.showToast({ title: '孵化记录创建成功', icon: 'success' })
      this.hideIncubationDialog()
      this.loadData()
    } catch (err) {
      wx.showToast({ title: '创建失败', icon: 'none' })
    }
  },
  async removeFromBreeding(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认移除',
      content: '确定要将此鸟从种鸟中移除吗？移除后状态将变为待售',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.updateParrotStatus(id, { status: 'available' })
            wx.showToast({ title: '已移除', icon: 'success' })
            this.loadData()
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  }
})
