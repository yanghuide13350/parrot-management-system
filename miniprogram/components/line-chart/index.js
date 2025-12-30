Component({
  properties: {
    title: { type: String, value: '月度销售趋势' },
    data: { type: Array, value: [] }
  },

  data: {
    activeTab: 'amount',
    ctx: null,
    canvas: null,
    dpr: 1
  },

  lifetimes: {
    attached() {
      this.initChart()
    }
  },

  observers: {
    'data, activeTab': function () {
      if (this.data.canvas) {
        this.drawChart()
      }
    }
  },

  methods: {
    switchTab(e) {
      this.setData({ activeTab: e.currentTarget.dataset.tab })
    },

    initChart() {
      const query = this.createSelectorQuery()
      query.select('#lineChart')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) return
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          this.setData({ ctx, canvas, dpr, width: res[0].width, height: res[0].height })
          this.drawChart()
        })
    },

    drawChart() {
      const { ctx, width, height, data, activeTab } = this.data
      if (!ctx || !data.length) return

      ctx.clearRect(0, 0, width, height)

      const padding = { top: 30, right: 20, bottom: 40, left: 50 }
      const chartW = width - padding.left - padding.right
      const chartH = height - padding.top - padding.bottom

      const values = data.map(d => activeTab === 'amount' ? d.amount : d.count)
      const maxVal = Math.max(...values, 1)
      const minVal = 0

      // 绘制网格线
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }

      // 绘制Y轴标签
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      for (let i = 0; i <= 4; i++) {
        const val = maxVal - (maxVal / 4) * i
        const y = padding.top + (chartH / 4) * i
        const label = activeTab === 'amount' ? (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0)) : val.toFixed(0)
        ctx.fillText(label, padding.left - 8, y + 4)
      }

      // 绘制X轴标签
      ctx.textAlign = 'center'
      const stepX = chartW / (data.length - 1 || 1)
      data.forEach((d, i) => {
        const x = padding.left + stepX * i
        ctx.fillText(d.month.slice(-2) + '月', x, height - 10)
      })

      // 绘制折线
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 2
      ctx.beginPath()
      data.forEach((d, i) => {
        const x = padding.left + stepX * i
        const val = activeTab === 'amount' ? d.amount : d.count
        const y = padding.top + chartH - (val / maxVal) * chartH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // 绘制渐变填充
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)')
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      data.forEach((d, i) => {
        const x = padding.left + stepX * i
        const val = activeTab === 'amount' ? d.amount : d.count
        const y = padding.top + chartH - (val / maxVal) * chartH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.lineTo(padding.left + stepX * (data.length - 1), padding.top + chartH)
      ctx.lineTo(padding.left, padding.top + chartH)
      ctx.closePath()
      ctx.fill()

      // 绘制数据点
      data.forEach((d, i) => {
        const x = padding.left + stepX * i
        const val = activeTab === 'amount' ? d.amount : d.count
        const y = padding.top + chartH - (val / maxVal) * chartH
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#667eea'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }
  }
})
