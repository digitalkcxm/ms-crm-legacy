const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

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
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ limit: '250mb', extended: true }))

customerRoutes(app)
emailRoutes(app)
phoneRoutes(app)
vehicleRoutes(app)
addressRoutes(app)
businessPartnerRoutes(app)

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`API is live on port ${port}`)
})

module.exports = app