const builderCustomer = require('../lib/builder-customer')
const Customer = require('../models/customer')

async function schedulePersist(dataCustomers, companyToken) {

  const customers = dataCustomers.map((data) => builderCustomer.buildCustomer(data, companyToken))

  return await Promise.all(customers.map((customer) => persistCustomer(customer)))
}

async function persistCustomer(customer) {
  await Customer.create({ cpfcnpj: customer.cpfcnpj, company_token: customer.company_token })
}

module.exports = { schedulePersist }