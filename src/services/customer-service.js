const builderCustomer = require('../lib/builder-customer')
const Customer = require('../models/customer')
const Email = require('../models/email')
const Phone = require('../models/phone')
const Address = require('../models/address')
const Vehicle = require('../models/vehicle')
const BusinessPartner = require('../models/business-partner')

const newCustomer = new Customer()
const newEmail = new Email()
const newPhone = new Phone()
const newAddress = new Address()
const newVehicle = new Vehicle()
const newBusinessPartner = new BusinessPartner()

async function schedulePersist(dataCustomers, companyToken) {

  const customers = dataCustomers.map((data) => builderCustomer.buildCustomer(data, companyToken))

  return await Promise.all(customers.map((customer) => persistCustomer(customer)))
}

async function persistCustomer(dataCustomer) {
  try {
    const customerId = await newCustomer.createOrUpdate(dataCustomer.customer.company_token, dataCustomer.customer.cpfcnpj, dataCustomer.customer)
    dataCustomer.email.forEach(email => {
      await newEmail.create(customerId, email.email)
    })
    
    dataCustomer.phone.forEach(phone => {
      await newPhone.createOrUpdate(customerId, phone)
    })
    
    dataCustomer.address.forEach(address => {
      await newAddress.createOrUpdate(customerId, address)
    })

    dataCustomer.vehicle.forEach(vehicle => {
      await newVehicle.createOrUpdate(customerId, vehicle)
    })

    dataCustomer.business_partner.forEach(businessPartner => {
      await newBusinessPartner.createOrUpdate(customerId, businessPartner)
    })
  } catch (err) {
    return err
  }
}

module.exports = { schedulePersist }