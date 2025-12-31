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
      const { filters } = this.data

      const params = {}
      if (filters.breed !== 'all') params.breed = filters.breed
      if (filters.gender !== 'all') params.gender = filters.gender
      if (filters.search) params.keyword = filters.search

      let res = []
      if (filters.pairingStatus === 'all') {
        const [breeding, paired, incubating] = await Promise.all([
          api.getParrots({ ...params, status: 'breeding' }),
          api.getParrots({ ...params, status: 'paired' }),
          api.getParrots({ ...params, status: 'incubating' })
        ])
        res = [
          ...(Array.isArray(breeding) ? breeding : breeding.items || []),
          ...(Array.isArray(paired) ? paired : paired.items || []),
          ...(Array.isArray(incubating) ? incubating : incubating.items || [])
        ]
      } else {
        const data = await api.getParrots({ ...params, status: filters.pairingStatus })
        res = Array.isArray(data) ? data : (data.items || [])
      }

      console.log('获取到的鹦鹉数据:', res)
      console.log('鹦鹉数量:', res.length)

      const listWithMate = []
      for (const p of res) {
        let mateInfo = { has_mate: false, mate: null, paired_at: null }
        try {
          mateInfo = await api.getMate(p.id)
        } catch (e) {
          console.log(`获取配偶信息失败 for parrot ${p.id}:`, e)
        }

        let pairingDuration = ''
        if (mateInfo.has_mate && mateInfo.paired_at) {
          const days = Math.floor((Date.now() - new Date(mateInfo.paired_at).getTime()) / (1000 * 60 * 60 * 24))
          pairingDuration = `配对 ${days} 天`
        }

        listWithMate.push({
          ...p,
          statusText: STATUS_MAP[p.status] || p.status,
          mateInfo: mateInfo.has_mate ? mateInfo.mate : null,
          pairingDuration
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
    e.stopPropagation()
    const { id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认取消配对',
      content: '确定要取消这个配对吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.unpairParrot(id)
            wx.showToast({ title: '取消配对成功', icon: 'success' })
            this.loadData()
          } catch (e) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },
  goIncubation(e) {
    e.stopPropagation()
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/incubation/add/index?father_id=${id}` })
  },
  goIncubationList(e) {
    e.stopPropagation()
    wx.navigateTo({ url: '/pages/incubation/list/index' })
  }
})
