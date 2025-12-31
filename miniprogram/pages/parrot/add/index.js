const api = require('../../../services/api')
const { formatDate } = require('../../../utils/date')

Page({
  data: {
    form: {
      breed: '',
      gender: '',
      birth_date: '',
      ring_number: '',
      price: '',
      health_notes: ''
    },
    genders: ['公', '母', '未验卡'],
    genderIndex: -1,
    breeds: [],
    allBreeds: [],
    filteredBreeds: [],
    showBreedList: false,
    photos: [],
    submitting: false
  },
  onLoad() {
    if (this) {
      this.loadBreeds()
    }
  },
  async loadBreeds() {
    if (!this) return
    try {
      const stats = await api.getStatistics()
      if (stats.breed_counts) {
        const breedList = Object.keys(stats.breed_counts)
        this.setData({
          breeds: breedList,
          allBreeds: breedList,
          filteredBreeds: breedList
        })
      }
    } catch (e) { }
  },
  onBreedInput(e) {
    const value = e.detail.value
    this.setData({ 'form.breed': value })

    // 过滤品种列表
    if (value) {
      const filtered = this.data.allBreeds.filter(breed =>
        breed.toLowerCase().includes(value.toLowerCase())
      )
      this.setData({ filteredBreeds: filtered, showBreedList: true })
    } else {
      this.setData({ filteredBreeds: this.data.allBreeds, showBreedList: true })
    }
  },
  onBreedFocus() {
    this.setData({
      showBreedList: true,
      filteredBreeds: this.data.allBreeds
    })
  },
  onBreedBlur() {
    // 延迟隐藏列表，以便点击选择项生效
    setTimeout(() => {
      this.setData({ showBreedList: false })
    }, 200)
  },
  selectBreed(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      'form.breed': value,
      showBreedList: false
    })
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
      mediaType: ['image', 'video'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        const newMedia = res.tempFiles.map(f => {
          const isVideo = f.fileType === 'video'
          return {
            path: f.tempFilePath,
            uploaded: false,
            isVideo: isVideo
          }
        })
        this.setData({ photos: [...this.data.photos, ...newMedia] })
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
    if (!form.ring_number) return wx.showToast({ title: '请输入圈号', icon: 'none' })
    if (!form.birth_date) return wx.showToast({ title: '请选择出生日期', icon: 'none' })
    if (!form.price) return wx.showToast({ title: '请输入价格', icon: 'none' })

    try {
      const result = await api.checkRingNumber(form.ring_number)
      if (result.exists) return wx.showToast({ title: '圈号已存在', icon: 'none' })
    } catch (e) { }

    this.setData({ submitting: true })
    try {
      const data = { ...form }
      if (data.price) data.price = Number(data.price)
      // 删除空字符串字段，避免后端验证错误
      Object.keys(data).forEach(k => {
        if (data[k] === '' || data[k] === undefined || data[k] === null) {
          delete data[k]
        }
      })

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
