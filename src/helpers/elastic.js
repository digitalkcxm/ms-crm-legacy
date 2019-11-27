const moment = require('moment')
const axios = require('axios')

const host = process.env.ES_URL

async function updateCustomer (obj, index) {
  let newDate = moment(new Date()).format('YYYYMM')
  try {
    const result = await axios.post(`${host}/${index}-crm-${newDate}/customer/${obj.id}`, { doc: obj, upsert: obj })
    if (result)
      return result
  } catch (err) {
    return true
  }
}

async function searchCustomer (search, index) {
  try {
    const result = await axios.get(`${host}/${index}-crm-*/_search?q=*${search}*`)
    const data = result.data.hits.hits
    return data
  } catch (err) {
    return err
  }
}

module.exports = { updateCustomer, searchCustomer }
