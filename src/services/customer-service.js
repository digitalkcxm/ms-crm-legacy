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

async function schedulePersist(dataCustomers, companyToken, businessId, businessTemplateId, listKeyFields, prefixIndexElastic) {
  
  var customers = []
  dataCustomers.forEach((data) => {
    var customer = builderCustomer.buildCustomer(data, companyToken)
    customers.push(customer)
  })

  try {
    return await Promise.all(customers.map((customer) => persistCustomer(customer, businessId, businessTemplateId, translateFields(listKeyFields), prefixIndexElastic)))
  } catch (err) {
    console.error('SCHEDULE PERSIST ==>', err)
    return err
  }
}

function translateFields (fields) {
  return fields.map(f => {
    if (f == 'customer_cpfcnpj') return 'cpfcnpj'
    else if (f == 'customer_name') return 'name'
    else if (f == 'customer_email') return 'email'
    else if (f == 'customer_phone_number') return 'number'
  })
}

async function persistCustomer(dataCustomer, businessId, businessTemplateId, listKeyFields, prefixIndexElastic) {
  var dataKeyFields = []
  listKeyFields.forEach(f => {
    dataKeyFields[f] = dataCustomer.customer[f]
  })
  
  try {
    const customerId = await newCustomer.createOrUpdate(dataCustomer.customer.company_token, dataCustomer.customer.cpfcnpj, dataCustomer.customer, businessId, businessTemplateId, dataKeyFields)
    await updateCustomer({
      id: customerId,
      customer_cpfcnpj:
      dataCustomer.customer.cpfcnpj,
      customer_name: dataCustomer.customer.name,
      customer_phome: dataCustomer.phone,
      customer_email: dataCustomer.email }, prefixIndexElastic)
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
    console.error('PERSIST CUSTOMER ==>', err)
    return err
  }
}

module.exports = { schedulePersist }