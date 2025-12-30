const api = require('../../../services/api')
const { STATUS_MAP, FOLLOW_UP_STATUS } = require('../../../utils/constants')
const { calcAge, formatDate } = require('../../../utils/date')

Page({
  data: {
    id: null,
    parrot: null,
    photos: [],
    timeline: [],
    loading: true,
    showSaleModal: false,
    showReturnModal: false,
    showFollowUpModal: false,
    saleForm: { seller: '', buyer_name: '', sale_price: '', contact: '' },
    returnReason: '',
    followUpForm: { status: 'completed', notes: '' }
  },
  onLoad(options) {
    this.setData({ id: options.id })
    this.loadData()
  },
  onShow() {
    // 页面显示时刷新数据（从编辑页返回时触发）
    if (this.data.id) {
      this.loadData()
    }
  },
  async loadData() {
    this.setData({ loading: true })
    try {
      const parrot = await api.getParrot(this.data.id)
      if (!parrot) {
        wx.showToast({ title: '鹦鹉不存在', icon: 'none' })
        return
      }
      const [photosRes, timelineRes] = await Promise.all([
        api.getPhotos(this.data.id).catch(() => []),
        api.getSalesTimeline(this.data.id).catch(() => [])
      ])
      const photos = Array.isArray(photosRes) ? photosRes : (photosRes?.items || [])
      // 构建完整的图片URL并判断文件类型
      const photosWithUrl = photos.map(p => {
        const url = `http://127.0.0.1:8000/uploads/${p.file_path}`
        const isVideo = p.file_name && (p.file_name.endsWith('.mov') || p.file_name.endsWith('.mp4') || p.file_name.endsWith('.avi'))
        return {
          ...p,
          url,
          isVideo
        }
      })
      const timeline = Array.isArray(timelineRes) ? timelineRes : (timelineRes?.items || timelineRes?.timeline || [])
      this.setData({
        parrot: {
          ...parrot,
          statusText: STATUS_MAP[parrot.status] || parrot.status,
          age: calcAge(parrot.birth_date),
          priceText: this.formatPrice(parrot),
          followUpText: FOLLOW_UP_STATUS[parrot.follow_up_status] || ''
        },
        photos: photosWithUrl,
        timeline: timeline.map(t => ({
          ...t,
          title: t.event || t.title,
          dateText: formatDate(t.date || t.created_at, 'MM-DD HH:mm')
        })),
        loading: false
      })
    } catch (e) {
      console.error('加载详情失败:', e)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  formatPrice(p) {
    if (p.price) return `¥${p.price}`
    if (p.min_price && p.max_price) return `¥${p.min_price}-${p.max_price}`
    if (p.min_price) return `¥${p.min_price}起`
    return '未定价'
  },
  goEdit() {
    wx.navigateTo({ url: `/pages/parrot/edit/index?id=${this.data.id}` })
  },
  showSale() {
    this.setData({ showSaleModal: true })
  },
  hideSale() {
    this.setData({ showSaleModal: false })
  },
  onSaleInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`saleForm.${field}`]: e.detail.value })
  },
  async submitSale() {
    const { saleForm } = this.data
    if (!saleForm.buyer_name || !saleForm.sale_price) {
      return wx.showToast({ title: '请填写购买者和价格', icon: 'none' })
    }
    try {
      await api.updateSaleInfo(this.data.id, {
        ...saleForm,
        sale_price: Number(saleForm.sale_price)
      })
      await api.updateParrotStatus(this.data.id, { status: 'sold' })
      wx.showToast({ title: '售出成功', icon: 'success' })
      this.setData({ showSaleModal: false })
      this.loadData()
    } catch (e) { }
  },
  showReturn() {
    this.setData({ showReturnModal: true })
  },
  hideReturn() {
    this.setData({ showReturnModal: false })
  },
  onReturnInput(e) {
    this.setData({ returnReason: e.detail.value })
  },
  async submitReturn() {
    try {
      await api.returnParrot(this.data.id, { return_reason: this.data.returnReason })
      wx.showToast({ title: '退货成功', icon: 'success' })
      this.setData({ showReturnModal: false, returnReason: '' })
      this.loadData()
    } catch (e) { }
  },
  showFollowUp() {
    this.setData({ showFollowUpModal: true })
  },
  hideFollowUp() {
    this.setData({ showFollowUpModal: false })
  },
  onFollowUpStatus(e) {
    this.setData({ 'followUpForm.status': e.detail.value })
  },
  onFollowUpNotes(e) {
    this.setData({ 'followUpForm.notes': e.detail.value })
  },
  async submitFollowUp() {
    try {
      await api.createFollowUp(this.data.id, this.data.followUpForm)
      wx.showToast({ title: '回访成功', icon: 'success' })
      this.setData({ showFollowUpModal: false, followUpForm: { status: 'completed', notes: '' } })
      this.loadData()
    } catch (e) { }
  },
  async setBreeding() {
    if (this.data.parrot.gender === '未验卡') {
      return wx.showToast({ title: '未验卡不能设为种鸟', icon: 'none' })
    }
    try {
      await api.updateParrotStatus(this.data.id, { status: 'breeding' })
      wx.showToast({ title: '已设为种鸟', icon: 'success' })
      this.loadData()
    } catch (e) { }
  },
  goPair() {
    wx.navigateTo({ url: `/pages/breeding/pair/index?id=${this.data.id}` })
  },
  async unpair() {
    wx.showModal({
      title: '确认取消配对',
      content: '确定要取消配对吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.unpairParrot(this.data.id)
            wx.showToast({ title: '已取消配对', icon: 'success' })
            this.loadData()
          } catch (e) { }
        }
      }
    })
  },
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({ current: url, urls: this.data.photos.map(p => p.url) })
  },
  async onShare() {
    try {
      const res = await api.createShareLink(this.data.id, { expires_in_days: 7 })
      wx.setClipboardData({ data: res.share_url })
      wx.showToast({ title: '链接已复制', icon: 'success' })
    } catch (e) { }
  },
  onShareAppMessage() {
    const { parrot } = this.data
    return {
      title: `${parrot.breed} - ${parrot.gender}`,
      path: `/pages/share/index?id=${this.data.id}`
    }
  }
})
