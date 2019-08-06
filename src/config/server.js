const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

const customerRouter = require('../routes/customer-router')
const emailRouter = require('../routes/email-router')

const app = express()

app.use(helmet())
app.use(cors())
app.use(expressValidator())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ limit: '250mb', extended: true }))

customerRouter(app)
emailRouter(app)

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`API is live on port ${port}`)
})

module.exports = app