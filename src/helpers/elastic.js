const moment = require('moment')
const axios = require('axios')

const host = process.env.ES_URL
const index = process.env.ES_INDEX_PREFIX

async function updateCustomer (obj) {
  let newDate = moment(new Date()).format('YYYYMM')
  try {
    const result = await axios.post(`${host}/${index}-customer-${newDate}/customer/${obj.customer_cpfcnpj}`, { doc: obj, upsert: obj })
    if (result)
      return result
  } catch (err) {
    return true
  }
}

async function searchCustomer (search) {
  try {
    const result = await axios.get(`${host}/${index}-customer-*/_search?q=${search}`)
    return result.data.hits.hits
  } catch (err) {
    return err
  }
}

module.exports = { updateCustomer, searchCustomer }
