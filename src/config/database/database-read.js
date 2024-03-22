const environment = process.env.NODE_ENV || 'development'
const appEnv = process.env.APP_ENVIRONMENT || 'development'
const readEnv = environment === 'production' && appEnv === 'prod' ? 'production_read' : environment
const configuration = require('../../../knexfile')[readEnv]

const knex = require('knex')(configuration)

module.exports = knex
