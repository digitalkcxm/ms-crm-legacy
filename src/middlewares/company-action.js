const moment = require('moment')

function printCompanyOnAction (req, res, next) {
  if (req.headers.token) {
    const currentDatetime = moment().format('YYYY-MM-DD hh:mm:ss')
    console.log(`[${currentDatetime}]`, 'enpoint:', req.method, req.url, ' -> company:', req.headers.token)
  }
  next()
}

module.exports = { printCompanyOnAction }