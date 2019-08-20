const builderCustomer = require('../lib/builder-customer')
const Customer = require('../models/customer')
const Email = require('../models/email')
const Phone = require('../models/phone')
const Address = require('../models/address')
const Vehicle = require('../models/vehicle')
const BusinessPartner = require('../models/business-partner')
const { updateCustomer } = require('../helpers/elastic')

const newCustomer = new Customer()
const newEmail = new Email()
const newPhone = new Phone()
const newAddress = new Address()
const newVehicle = new Vehicle()
const newBusinessPartner = new BusinessPartner()

async function schedulePersist(dataCustomers, companyToken, businessId, businessTemplateId) {

  const customers = dataCustomers.map((data) => builderCustomer.buildCustomer(data, companyToken))

  return await Promise.all(customers.map((customer) => persistCustomer(customer, businessId, businessTemplateId)))
}

async function persistCustomer(dataCustomer, businessId, businessTemplateId) {
  try {
    const customerId = await newCustomer.createOrUpdate(dataCustomer.customer.company_token, dataCustomer.customer.cpfcnpj, dataCustomer.customer, businessId, businessTemplateId)
    await updateCustomer({ customer_cpfcnpj: dataCustomer.customer.cpfcnpj, customer_name: dataCustomer.customer.name })
    await dataCustomer.email.forEach(async (email) => {
      await newEmail.create(customerId, email.email)
    })
    
    await dataCustomer.phone.forEach(async (phone) => {
      await newPhone.createOrUpdate(customerId, phone)
    })
    
    await dataCustomer.address.forEach(async (address) => {
      await newAddress.createOrUpdate(customerId, address)
    })

    await dataCustomer.vehicle.forEach(async (vehicle) => {
      await newVehicle.createOrUpdate(customerId, vehicle)
    })

    await dataCustomer.business_partner.forEach(async (businessPartner) => {
      await newBusinessPartner.createOrUpdate(customerId, businessPartner)
    })
  } catch (err) {
    return err
  }
}

module.exports = { schedulePersist }