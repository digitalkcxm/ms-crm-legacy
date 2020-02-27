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
  
  let customers = []
  dataCustomers.forEach((data) => {
    let customer = builderCustomer.buildCustomer(data, companyToken)
    customers.push(customer)
  })

  try {
    let customerId = ''
    for (const customer of customers) {
    	customerId = await persistCustomer(customer, businessId, businessTemplateId, translateFields(listKeyFields), prefixIndexElastic)
    }
    
    return customerId
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
    else if (f == 'customer_phone_number') return 'phone'
  })
}

async function persistCustomer(dataCustomer, businessId, businessTemplateId, listKeyFields, prefixIndexElastic) {
  let dataKeyFields = {}
  listKeyFields.forEach(f => {
    if (['email', 'phone'].includes(f)) {
      if (f === 'email') dataKeyFields[f] = dataCustomer.email.map(e => e.email)
      else if (f === 'phone') dataKeyFields[f] = dataCustomer.phone.map(p => p.number)
    } else {
      dataKeyFields[f] = dataCustomer.customer[f]
    }
  })
  
  try {
    const customerId = await newCustomer.createOrUpdate(dataCustomer.customer.company_token, dataCustomer.customer, businessId, businessTemplateId, dataKeyFields)
    
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

    return customerId
  } catch (err) {
    console.error('PERSIST CUSTOMER ==>', err)
    return err
  }
}

module.exports = { schedulePersist }
