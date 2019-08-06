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
    if (dataCustomer.email.length > 0) {
      const emailId = await newEmail.create(customerId, dataCustomer.email[0].email)
    }

    if (dataCustomer.phone.length > 0) {
      const phoneId = await newPhone.createOrUpdate(customerId, dataCustomer.phone[0])
    }

    if (dataCustomer.address.length > 0) {
      const addressId = await newAddress.createOrUpdate(customerId, dataCustomer.address[0])
    }

    if (dataCustomer.vehicle.length > 0) {
      const vehicleId = await newVehicle.createOrUpdate(customerId, dataCustomer.vehicle[0])
    }

    if (dataCustomer.business_partner.length > 0) {
      const businessPartnerId = await newBusinessPartner.createOrUpdate(customerId, dataCustomer.business_partner[0])
    }
  } catch (err) {
    return err
  }
}

module.exports = { schedulePersist }