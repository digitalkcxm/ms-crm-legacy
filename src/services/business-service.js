const axios = require('axios')

async function sendNotificationStorageCompleted(businessId, companyToken) {
  try {
    return await createAxiosInstance(companyToken).post('/business/customer-storaging', { businessId, status: 'completed' })
  } catch (e) {
    console.error('ERRO ENVIAR NOTIFICACAO BUSINESS', { businessId })
  }
}

function createAxiosInstance(companyToken) {
  return axios.create({
    baseURL: process.env.MSBUSINESS_URL,
    headers: { 'token' : `${companyToken}` },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 0
  })
}

module.exports = { sendNotificationStorageCompleted }