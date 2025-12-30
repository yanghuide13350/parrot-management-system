const api = require('../../../services/api')

Page({
  data: {
    id: null,
    form: {},
    genders: ['公', '母', '未验卡'],
    genderIndex: -1,
    photos: [],
    originalRingNumber: '',
    submitting: false
  },
  onLoad(options) {
    this.setData({ id: options.id })
    this.loadData()
  },
  async loadData() {
    try {
      const [parrot, photos] = await Promise.all([
        api.getParrot(this.data.id),
        api.getPhotos(this.data.id).catch(() => [])
      ])
      const genderIndex = this.data.genders.indexOf(parrot.gender)
      this.setData({
        form: {
          breed: parrot.breed,
          gender: parrot.gender,
          birth_date: parrot.birth_date || '',
          ring_number: parrot.ring_number || '',
          price: parrot.price || '',
          health_notes: parrot.health_notes || ''
        },
        genderIndex,
        originalRingNumber: parrot.ring_number || '',
        photos: photos.map(p => ({ ...p, uploaded: true, url: `http://127.0.0.1:8000/uploads/${p.file_path}` }))
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },
  onGenderChange(e) {
    const index = e.detail.value
    this.setData({ genderIndex: index, 'form.gender': this.data.genders[index] })
  },
  onDateChange(e) {
    this.setData({ 'form.birth_date': e.detail.value })
  },
  choosePhoto() {
    wx.chooseMedia({
      count: 9 - this.data.photos.length,
      mediaType: ['image'],
      success: (res) => {
        const newPhotos = res.tempFiles.map(f => ({ path: f.tempFilePath, uploaded: false }))
        this.setData({ photos: [...this.data.photos, ...newPhotos] })
      }
    })
  },
  removePhoto(e) {
    const { index } = e.currentTarget.dataset
    const photos = [...this.data.photos]
    photos.splice(index, 1)
    this.setData({ photos })
  },
  async submit() {
    const { form, originalRingNumber } = this.data
    if (!form.breed) return wx.showToast({ title: '请输入品种', icon: 'none' })
    if (!form.gender) return wx.showToast({ title: '请选择性别', icon: 'none' })
    if (!form.ring_number) return wx.showToast({ title: '请输入圈号', icon: 'none' })
    if (!form.birth_date) return wx.showToast({ title: '请选择出生日期', icon: 'none' })
    if (!form.price) return wx.showToast({ title: '请输入价格', icon: 'none' })

    if (form.ring_number !== originalRingNumber) {
      try {
        const result = await api.checkRingNumber(form.ring_number)
        if (result.exists) return wx.showToast({ title: '圈号已存在', icon: 'none' })
      } catch (e) { }
    }

    this.setData({ submitting: true })
    try {
      const data = { ...form }
      if (data.price) data.price = Number(data.price)
      // 删除空字符串字段，后端不需要这些字段
      Object.keys(data).forEach(k => {
        if (data[k] === '' || data[k] === undefined || data[k] === null) {
          delete data[k]
        }
      })

      await api.updateParrot(this.data.id, data)

      for (const photo of this.data.photos) {
        if (!photo.uploaded) {
          await api.uploadPhoto(this.data.id, photo.path)
        }
      }

      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      this.setData({ submitting: false })
    }
  }
})
