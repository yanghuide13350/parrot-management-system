const { request, uploadFile } = require('../utils/request')

module.exports = {
  getParrots: (params) => request({ url: '/parrots', data: params }),
  getParrot: (id) => request({ url: `/parrots/${id}` }),
  createParrot: (data) => request({ url: '/parrots', method: 'POST', data }),
  updateParrot: (id, data) => request({ url: `/parrots/${id}`, method: 'PUT', data }),
  deleteParrot: (id) => request({ url: `/parrots/${id}`, method: 'DELETE' }),
  updateParrotStatus: (id, data) => request({ url: `/parrots/${id}/status`, method: 'PUT', data }),
  checkRingNumber: (ringNumber) => request({ url: `/parrots/ring-number/${ringNumber}/exists` }),

  getSalesRecords: (params) => request({ url: '/sales-records', data: params }),
  getSalesHistory: (params) => request({ url: '/sales-history', data: params }),
  updateSaleInfo: (id, data) => request({ url: `/parrots/${id}/sale-info`, method: 'PUT', data }),
  getSaleInfo: (id) => request({ url: `/parrots/${id}/sale-info` }),
  getSalesTimeline: (id) => request({ url: `/parrots/${id}/sales-timeline` }),
  returnParrot: (id, data) => request({ url: `/parrots/${id}/return`, method: 'PUT', data }),

  createFollowUp: (id, data) => request({ url: `/parrots/${id}/follow-ups`, method: 'POST', data }),
  getFollowUps: (id) => request({ url: `/parrots/${id}/follow-ups` }),

  pairParrots: (data) => request({ url: '/parrots/pair', method: 'POST', data }),
  unpairParrot: (id) => request({ url: `/parrots/unpair/${id}`, method: 'POST' }),
  getEligibleFemales: (maleId) => request({ url: `/parrots/eligible-females/${maleId}` }),
  getMate: (id) => request({ url: `/parrots/${id}/mate` }),

  getIncubationRecords: (params) => request({ url: '/incubation', data: params }),
  createIncubation: (data) => request({ url: '/incubation', method: 'POST', data }),
  updateIncubation: (id, data) => request({ url: `/incubation/${id}`, method: 'PUT', data }),

  getStatistics: () => request({ url: '/statistics' }),
  getSalesStatistics: () => request({ url: '/statistics/sales' }),
  getReturnsStatistics: () => request({ url: '/statistics/returns' }),
  getMonthlySales: () => request({ url: '/statistics/monthly-sales' }),

  getPhotos: (id) => request({ url: `/parrots/${id}/photos` }),
  uploadPhoto: (id, filePath) => uploadFile(`/parrots/${id}/photos`, filePath),

  createShareLink: (id, data) => request({ url: `/share/parrots/${id}`, method: 'POST', data }),
  getShareInfo: (token) => request({ url: `/share/${token}` })
}
