const moment = require('moment')
const axios = require('axios')

const host = process.env.ES_URL

async function updateCustomer (obj, index) {
  let newDate = moment(new Date()).format('YYYYMM')
  try {
    const result = await axios.post(`${host}/${index}-crm-${newDate}/customer/${obj.id}`, { doc: obj, upsert: obj })
    console.log('elastic', 'aaaa')
    if (result)
      return result
  } catch (err) {
    console.error(err)
    return true
  }
}

async function searchCustomer (search, index) {
  try {
    const result = await axios.get(`${host}/${index}-crm-*/_search?q=${search}`)
    return result.data.hits.hits
  } catch (err) {
    return err
  }
}

module.exports = { updateCustomer, searchCustomer }
