const environment = process.env.NODE_ENV
const knex = require('knex')(require('../../../knexfile')[environment])

module.exports = knex