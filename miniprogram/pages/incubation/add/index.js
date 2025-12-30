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
    submitting: false
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      this.loadRecord()
    } else {
      this.loadParents()
    }
  },
  async loadParents() {
    try {
      const res = await api.getParrots({ status: 'paired,incubating' })
      const males = res.filter(p => p.gender === '公').map(p => ({ id: p.id, label: `${p.breed} (${p.ring_number || '无圈号'})` }))
      const females = res.filter(p => p.gender === '母').map(p => ({ id: p.id, label: `${p.breed} (${p.ring_number || '无圈号'})` }))
      this.setData({ males, females })
    } catch (e) { }
  },
  async loadRecord() {
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
  onFatherChange(e) {
    const male = this.data.males[e.detail.value]
    this.setData({ 'form.father_id': male.id, fatherLabel: male.label })
  },
  onMotherChange(e) {
    const female = this.data.females[e.detail.value]
    this.setData({ 'form.mother_id': female.id, motherLabel: female.label })
  },
  onStartDateChange(e) {
    this.setData({ 'form.start_date': e.detail.value })
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
