const express = require('express')

const app = express()

const database = require('./database/database')

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`API is live on port ${port}`)
})

module.exports = app