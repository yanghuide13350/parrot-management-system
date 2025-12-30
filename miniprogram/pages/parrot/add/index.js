const api = require('../../../services/api')
const { formatDate } = require('../../../utils/date')

Page({
  data: {
    form: {
      breed: '',
      gender: '',
      birth_date: '',
      ring_number: '',
      min_price: '',
      max_price: '',
      health_notes: ''
    },
    genders: ['公', '母', '未验卡'],
    genderIndex: -1,
    breeds: [],
    photos: [],
    submitting: false
  },
  onLoad() {
    this.loadBreeds()
  },
  async loadBreeds() {
    try {
      const stats = await api.getStatistics()
      if (stats.breed_counts) {
        this.setData({ breeds: Object.keys(stats.breed_counts) })
      }
    } catch (e) { }
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
    const { form } = this.data
    if (!form.breed) return wx.showToast({ title: '请输入品种', icon: 'none' })
    if (!form.gender) return wx.showToast({ title: '请选择性别', icon: 'none' })

    if (form.ring_number) {
      try {
        const exists = await api.checkRingNumber(form.ring_number)
        if (exists) return wx.showToast({ title: '圈号已存在', icon: 'none' })
      } catch (e) { }
    }

    this.setData({ submitting: true })
    try {
      const data = { ...form }
      if (data.min_price) data.min_price = Number(data.min_price)
      if (data.max_price) data.max_price = Number(data.max_price)
      Object.keys(data).forEach(k => !data[k] && delete data[k])

      const parrot = await api.createParrot(data)

      for (const photo of this.data.photos) {
        if (!photo.uploaded) {
          await api.uploadPhoto(parrot.id, photo.path)
        }
      }

      wx.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      this.setData({ submitting: false })
    }
  }
})
