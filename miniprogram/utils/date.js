function formatDate(date, fmt = 'YYYY-MM-DD') {
  if (!date) return ''
  const d = new Date(date)
  const map = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0')
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm/g, m => map[m])
}

function calcAge(birthDate) {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  if (months < 1) return '不足1月'
  if (months < 12) return `${months}月龄`
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return remainMonths ? `${years}岁${remainMonths}月` : `${years}岁`
}

module.exports = { formatDate, calcAge }
