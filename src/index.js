require('dotenv').config()
require('./config/server').listen

const startConsumersQueues = require('./config/consumerqueues')

startConsumersQueues()