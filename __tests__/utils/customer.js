const database = require('../../src/config/database/database')

async function truncateCustomer() {
  await database.raw('TRUNCATE customer CASCADE')
}

module.exports = { truncateCustomer }