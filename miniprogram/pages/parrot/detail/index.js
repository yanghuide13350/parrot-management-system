const api = require('../../../services/api')
const { STATUS_MAP, FOLLOW_UP_STATUS } = require('../../../utils/constants')
const { calcAge, formatDate } = require('../../../utils/date')

Page({
  data: {
    id: null,
    parrot: null,
    photos: [],
    timeline: [],
    shareLinks: [],
    loading: true,
    showSaleModal: false,
    showReturnModal: false,
    showFollowUpModal: false,
    saleForm: { seller: '', buyer_name: '', sale_price: '', contact: '', follow_up_status: 'pending' },
    sellerOptions: ['杨慧德', '杨慧艳', '贾号号'],
    returnReason: '',
    followUpForm: { status: 'completed', notes: '' }
  },
  onLoad(options) {
    if (this) {
      this.setData({ id: options.id })
      this.loadData()
    }
  },
  onShow() {
    // 页面显示时刷新数据（从编辑页返回时触发）
    if (this && this.data && this.data.id) {
      this.loadData()
    }
  },
  // ... (omitted loadData and stats methods) ...
  async loadData() {
    if (!this) return
    this.setData({ loading: true })
    try {
      const parrot = await api.getParrot(this.data.id)
      if (!parrot) {
        wx.showToast({ title: '鹦鹉不存在', icon: 'none' })
        return
      }
      const [photosRes, timelineRes, shareLinksRes] = await Promise.all([
        api.getPhotos(this.data.id).catch(() => []),
        api.getSalesTimeline(this.data.id).catch(() => []),
        api.getShareLinks(this.data.id).catch(() => [])
      ])
      const photos = Array.isArray(photosRes) ? photosRes : (photosRes?.items || [])
      // 构建完整的图片URL并判断文件类型
      const app = getApp()
      const baseUrl = app.globalData.baseUrl.replace('/api', '')
      const photosWithUrl = photos.map(p => {
        const url = `${baseUrl}/uploads/${p.file_path}`
        const isVideo = p.file_name && (p.file_name.endsWith('.mov') || p.file_name.endsWith('.mp4') || p.file_name.endsWith('.avi'))
        return {
          ...p,
          url,
          isVideo
        }
      })
      const timeline = Array.isArray(timelineRes) ? timelineRes : (timelineRes?.items || timelineRes?.timeline || [])
      const allShareLinks = Array.isArray(shareLinksRes) ? shareLinksRes : (shareLinksRes?.items || [])
      // 只显示最新的一个分享链接
      const shareLinks = allShareLinks.length > 0 ? [allShareLinks[0]] : []
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
        shareLinks,
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
    this.setData({
      showSaleModal: true,
      'saleForm.follow_up_status': 'pending'
    })
  },
  hideSale() {
    this.setData({ showSaleModal: false })
  },
  onSaleInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`saleForm.${field}`]: e.detail.value })
  },
  onSellerTagTap(e) {
    const { value } = e.currentTarget.dataset
    this.setData({ 'saleForm.seller': value })
  },
  onSaleFollowUpStatusChange(e) {
    const statusMap = ['pending', 'completed', 'no_contact']
    this.setData({ 'saleForm.follow_up_status': statusMap[e.detail.value] })
  },
  async submitSale() {
    const { saleForm } = this.data
    if (!saleForm.seller) {
      return wx.showToast({ title: '请选择售卖人', icon: 'none' })
    }
    if (!saleForm.buyer_name) {
      return wx.showToast({ title: '请填写购买者', icon: 'none' })
    }
    if (!saleForm.sale_price) {
      return wx.showToast({ title: '请填写价格', icon: 'none' })
    }
    if (!saleForm.contact) {
      return wx.showToast({ title: '请填写联系方式', icon: 'none' })
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
    } catch (e) {
      console.error(e) // Log error to see if backend rejects it
    }
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
    const statusMap = ['completed', 'pending', 'no_contact']
    const index = e.detail.value
    this.setData({ 'followUpForm.status': statusMap[index] })
  },
  onFollowUpNotes(e) {
    this.setData({ 'followUpForm.notes': e.detail.value })
  },
  async submitFollowUp() {
    try {
      const { followUpForm } = this.data
      // 将 status 字段转换为 follow_up_status
      const data = {
        follow_up_status: followUpForm.status,
        notes: followUpForm.notes
      }
      await api.createFollowUp(this.data.id, data)
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
      // 先删除所有旧的分享链接
      const oldLinks = this.data.shareLinks
      if (oldLinks && oldLinks.length > 0) {
        await Promise.all(oldLinks.map(link => api.deleteShareLink(link.token).catch(() => { })))
      }

      // 生成新的分享链接
      const res = await api.createShareLink(this.data.id, { expires_in_days: 7 })
      wx.setClipboardData({ data: res.url })
      wx.showToast({ title: '新分享链接已生成并复制', icon: 'success' })

      // 只显示新生成的链接
      this.setData({ shareLinks: [res] })
    } catch (e) {
      console.error('分享失败:', e)
      wx.showToast({ title: '分享失败', icon: 'none' })
    }
  },
  copyShareUrl(e) {
    const url = e.currentTarget.dataset.url
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' })
      }
    })
  },
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这只鹦鹉吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteParrot(this.data.id)
            wx.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (e) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },
  onShareAppMessage() {
    const { parrot } = this.data
    return {
      title: `${parrot.breed} - ${parrot.gender}`,
      path: `/pages/share/index?id=${this.data.id}`
    }
  }
})
