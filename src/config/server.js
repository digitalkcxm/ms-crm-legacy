const tracing = require('./elastic-apm')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

const healthRoute = require('../routes/health')
const customerRoutes = require('../routes/customer-router')
const emailRoutes = require('../routes/email-router')
const phoneRoutes = require('../routes/phone-router')
const vehicleRoutes = require('../routes/vehicle-router')
const addressRoutes = require('../routes/address-router')
const businessPartnerRoutes = require('../routes/business-partner-router')

const app = express()

app.use(helmet())
app.use(cors())
app.use(expressValidator())
app.use(bodyParser.json({ limit: '5012mb', extended: true }))
app.use(bodyParser.urlencoded({ extended: true, limit: '5012mb' }))

healthRoute(app, tracing)
customerRoutes(app, tracing)
emailRoutes(app, tracing)
phoneRoutes(app, tracing)
vehicleRoutes(app, tracing)
addressRoutes(app, tracing)
businessPartnerRoutes(app, tracing)

global.cache = {
  customerList: {},
  default_expire: (process.env.EXPIRE_CACHE_IN_SEC) ? parseInt(process.env.EXPIRE_CACHE_IN_SEC) : 600
}

const port = process.env.PORT || 4000
if (process.env.NODE_ENV !== 'testing') {
  app.listen(port, () => {
    console.log(`API is live on port ${port}`)
  })
}

module.exports = app
