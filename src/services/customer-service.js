const builderCustomer = require('../lib/builder-customer')

async function schedulePersist(dataCustomers, userId, businessId) {

  const customers = dataCustomers.map((data) => builderCustomer.buildCustomer(data, userId, businessId))

  return await Promise.all(customers.map((customer) => persistCustomer(customer)))
}

async function persistCustomer(customer) {
  
}

module.exports = { schedulePersist }