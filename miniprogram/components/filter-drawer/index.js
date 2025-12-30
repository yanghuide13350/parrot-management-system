Component({
  properties: {
    visible: { type: Boolean, value: false },
    breeds: { type: Array, value: [] },
    filters: { type: Object, value: {} }
  },
  data: {
    genders: ['公', '母', '未验卡'],
    statuses: [
      { value: 'available', label: '待售' },
      { value: 'sold', label: '已售' },
      { value: 'breeding', label: '种鸟' },
      { value: 'paired', label: '已配对' },
      { value: 'incubating', label: '孵化中' }
    ],
    localFilters: {}
  },
  observers: {
    'filters': function (f) {
      this.setData({ localFilters: { ...f } })
    }
  },
  methods: {
    preventMove() { },
    onTagTap(e) {
      const { field, value } = e.currentTarget.dataset
      const localFilters = { ...this.data.localFilters }
      localFilters[field] = localFilters[field] === value ? '' : value
      this.setData({ localFilters })
    },
    onPriceInput(e) {
      const { field } = e.currentTarget.dataset
      let { value } = e.detail

      // 转换为数字，空字符串转为undefined
      value = value === '' ? undefined : Number(value)

      // 验证是否为有效数字
      if (value !== undefined && (isNaN(value) || value < 0)) {
        value = 0
      }

      const localFilters = { ...this.data.localFilters }
      if (value === undefined || value === 0) {
        delete localFilters[field]
      } else {
        localFilters[field] = value
      }
      this.setData({ localFilters })
    },
    onReset() {
      this.setData({ localFilters: {} })
    },
    onClose() {
      this.triggerEvent('close')
    },
    onConfirm() {
      this.triggerEvent('confirm', { filters: this.data.localFilters })
    }
  }
})
