const api = require('../../../services/api')
const { formatDate } = require('../../../utils/date')

Page({
  data: {
    id: null,
    isEdit: false,
    form: {
      father_id: null,
      mother_id: null,
      start_date: '',
      expected_hatch_date: '',
      eggs_count: '',
      actual_hatch_date: '',
      hatched_count: '',
      status: 'incubating',
      notes: ''
    },
    males: [],
    females: [],
    fatherLabel: '',
    motherLabel: '',
    statuses: [
      { value: 'incubating', label: '孵化中' },
      { value: 'hatched', label: '已孵化' },
      { value: 'failed', label: '失败' }
    ],
    statusLabel: '孵化中',
    submitting: false,
    allParrots: []
  },
  onLoad(options) {
    if (this) {
      if (options.id) {
        this.setData({ id: options.id, isEdit: true })
        this.loadRecord()
      } else {
        this.loadParents()
      }

      if (options.father_id) {
        this.setData({ 'form.father_id': Number(options.father_id) })
        this.loadParents()
      }
    }
  },
  async loadParents() {
    if (!this) return
    try {
      const [paired, incubating] = await Promise.all([
        api.getParrots({ status: 'paired' }),
        api.getParrots({ status: 'incubating' })
      ])
      const pairedData = Array.isArray(paired) ? paired : (paired.items || [])
      const incubatingData = Array.isArray(incubating) ? incubating : (incubating.items || [])
      const res = [...pairedData, ...incubatingData]

      const now = new Date()
      const fourMonthsAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)

      const validMales = res.filter(p => {
        if (p.gender !== '公') return false
        if (!p.birth_date) return true
        return new Date(p.birth_date) <= fourMonthsAgo
      }).map(p => ({ id: p.id, label: `${p.breed} (${p.ring_number || '无圈号'})`, birth_date: p.birth_date }))

      const validFemales = res.filter(p => {
        if (p.gender !== '母') return false
        if (!p.birth_date) return true
        return new Date(p.birth_date) <= fourMonthsAgo
      }).map(p => ({ id: p.id, label: `${p.breed} (${p.ring_number || '无圈号'})`, birth_date: p.birth_date }))

      this.setData({
        males: validMales,
        females: validFemales,
        allParrots: res
      })

      if (this.data.form.father_id) {
        const father = validMales.find(m => m.id === this.data.form.father_id)
        if (father) {
          this.setData({ fatherLabel: father.label })
          this.autoFillMother(father.id)
        }
      }

      if (this.data.form.mother_id) {
        const mother = validFemales.find(f => f.id === this.data.form.mother_id)
        if (mother) {
          this.setData({ motherLabel: mother.label })
        }
      }
    } catch (e) { }
  },
  async loadRecord() {
    if (!this) return
    try {
      const records = await api.getIncubationRecords({})
      const record = records.find(r => r.id == this.data.id)
      if (record) {
        this.setData({
          form: {
            father_id: record.father_id,
            mother_id: record.mother_id,
            start_date: record.start_date,
            expected_hatch_date: record.expected_hatch_date || '',
            eggs_count: record.eggs_count,
            actual_hatch_date: record.actual_hatch_date || '',
            hatched_count: record.hatched_count || '',
            status: record.status,
            notes: record.notes || ''
          },
          statusLabel: this.data.statuses.find(s => s.value === record.status)?.label || '孵化中'
        })
      }
    } catch (e) { }
  },
  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },
  async onFatherChange(e) {
    const male = this.data.males[e.detail.value]
    this.setData({ 'form.father_id': male.id, fatherLabel: male.label })
    await this.autoFillMother(male.id)
  },
  async onMotherChange(e) {
    const female = this.data.females[e.detail.value]
    this.setData({ 'form.mother_id': female.id, motherLabel: female.label })
    await this.autoFillFather(female.id)
  },
  async autoFillMother(fatherId) {
    try {
      const mateInfo = await api.getMate(fatherId)
      if (mateInfo.has_mate && mateInfo.mate) {
        const mother = this.data.females.find(f => f.id === mateInfo.mate.id)
        if (mother) {
          this.setData({
            'form.mother_id': mother.id,
            motherLabel: mother.label
          })
        }
      }
    } catch (e) { }
  },
  async autoFillFather(motherId) {
    try {
      const mateInfo = await api.getMate(motherId)
      if (mateInfo.has_mate && mateInfo.mate) {
        const father = this.data.males.find(m => m.id === mateInfo.mate.id)
        if (father) {
          this.setData({
            'form.father_id': father.id,
            fatherLabel: father.label
          })
        }
      }
    } catch (e) { }
  },
  onStartDateChange(e) {
    const startDate = e.detail.value
    this.setData({ 'form.start_date': startDate })

    const expectedDate = new Date(startDate)
    expectedDate.setDate(expectedDate.getDate() + 21)
    const expectedDateStr = expectedDate.toISOString().split('T')[0]
    this.setData({ 'form.expected_hatch_date': expectedDateStr })
  },
  onExpectedDateChange(e) {
    this.setData({ 'form.expected_hatch_date': e.detail.value })
  },
  onActualDateChange(e) {
    this.setData({ 'form.actual_hatch_date': e.detail.value })
  },
  onStatusChange(e) {
    const status = this.data.statuses[e.detail.value]
    this.setData({ 'form.status': status.value, statusLabel: status.label })
  },
  async submit() {
    const { form, isEdit, id } = this.data
    if (!isEdit && (!form.father_id || !form.mother_id)) {
      return wx.showToast({ title: '请选择父母鸟', icon: 'none' })
    }
    if (!form.start_date || !form.eggs_count) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' })
    }

    if (form.expected_hatch_date && form.start_date) {
      const expected = new Date(form.expected_hatch_date)
      const start = new Date(form.start_date)
      if (expected < start) {
        return wx.showToast({ title: '预期孵化日期不能早于开始日期', icon: 'none' })
      }
    }

    if (form.hatched_count && form.eggs_count) {
      if (Number(form.hatched_count) > Number(form.eggs_count)) {
        return wx.showToast({ title: '孵化数量不能超过蛋数量', icon: 'none' })
      }
    }

    this.setData({ submitting: true })
    try {
      const data = { ...form, eggs_count: Number(form.eggs_count) }
      if (data.hatched_count) data.hatched_count = Number(data.hatched_count)
      Object.keys(data).forEach(k => !data[k] && delete data[k])

      if (isEdit) {
        await api.updateIncubation(id, data)
      } else {
        await api.createIncubation(data)
      }

      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      this.setData({ submitting: false })
    }
  }
})
