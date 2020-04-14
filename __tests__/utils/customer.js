const database = require('../../src/config/database/database')

async function truncateCustomer() {
  await database.raw('TRUNCATE customer CASCADE')
  await database.raw('ALTER SEQUENCE customer_id_seq RESTART WITH 0')
}

module.exports = { truncateCustomer }