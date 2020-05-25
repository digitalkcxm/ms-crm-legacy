const Queue = require('bull')
const redis = require('redis')
const redisClient = redis.createClient({ port: process.env.REDIS_PORT, host: process.env.REDIS_HOST })

const builderCustomer = require('../lib/builder-customer')
const Customer = require('../models/customer')
const Email = require('../models/email')
const Phone = require('../models/phone')
const Address = require('../models/address')
const Vehicle = require('../models/vehicle')
const BusinessPartner = require('../models/business-partner')
const { sendNotificationStorageCompleted } = require('../services/business-service')

const newCustomer = new Customer()
const newEmail = new Email()
const newPhone = new Phone()
const newAddress = new Address()
const newVehicle = new Vehicle()
const newBusinessPartner = new BusinessPartner()

function translateFields (fields) {
  if (!fields) fields = ['customer_cpfcnpj']

  return fields.map(f => {
    if (f === 'customer_cpfcnpj') return 'cpfcnpj'
    else if (f === 'customer_name') return 'name'
    else if (f === 'customer_email') return 'email'
    else if (f === 'customer_phone_number') return 'phone'
  })
}

function getCustomerDataByField(dataCustomer = {}, listKeyFields = []) {
  let customerData = []
  for (let i in listKeyFields) {
    const keyField = listKeyFields[i]
  
    if (keyField === 'email' || keyField === 'phone') {
      if (keyField === 'email') customerData.push(...dataCustomer.email.map(e => e.email))
      else if (keyField === 'phone') customerData.push(...dataCustomer.phone.map(p => p.number))
    } else {
      customerData.push(dataCustomer.customer[keyField])
    }
  }
  
  return customerData
}

async function separateBetweenUpdateOrCreate(customers = [], companyToken = '', searchKeys = [], businessId = [], businessTemplateId = []) {
  const customerUpdate = []
  const customerCreate = []
  const customersIndexed = []
  let searchValues = []
  console.time('mount query find')
  for (let i in customers) {
    const dataCustomer = customers[i]
    const values = getCustomerDataByField(dataCustomer, searchKeys)
    customersIndexed.push({ keys: searchKeys, keyValues: values, dataCustomer })
    
    searchValues.push(...values)
  }
  console.timeEnd('mount query find')

  console.time('query find')
  const customerStoredList = await newCustomer.getCustomerListByKeyField(searchKeys, searchValues, companyToken)
  console.timeEnd('query find')
  
  let customerStoredIndexed = {}
  for (let i in customerStoredList) {
    const customer = customerStoredList[i]
    const keys = []
    for (let x in searchKeys) {
      const key = searchKeys[x]
      keys.push(customer[key])
    }
    const indexKey = keys.join(':')
    customerStoredIndexed[indexKey] = customer
  }

  console.time('separate')
  for (let i in customersIndexed) {
    let customerMatch = []
    const customerIndexed = customersIndexed[i]
    const indexKeyIndexed = customerIndexed.keyValues.join(':')
    
    if (customerStoredIndexed[indexKeyIndexed]) {
      customerMatch.push(customerStoredIndexed[indexKeyIndexed])
    }
    
    if (customerMatch.length <= 0) {
      customerCreate.push(customerIndexed.dataCustomer)
    } else {
      const transientCustomer = customerIndexed.dataCustomer.customer
      
      transientCustomer.id = customerMatch[0].id
      transientCustomer.business_list = [...new Set(customerMatch[0].business_list.concat(businessId))]
      transientCustomer.business_template_list = [...new Set(customerMatch[0].business_template_list.concat(businessTemplateId))]

      if (!transientCustomer['name']) transientCustomer.name = customerMatch[0].name
      if (!transientCustomer['cpfcnpj']) transientCustomer.cpfcnpj = customerMatch[0].cpfcnpj
      if (!transientCustomer['person_type']) transientCustomer.person_type = customerMatch[0].person_type
      if (!transientCustomer['cpfcnpj_status']) transientCustomer.cpfcnpj_status = customerMatch[0].cpfcnpj_status
      if (!transientCustomer['birthdate']) transientCustomer.birthdate = customerMatch[0].birthdate
      if (!transientCustomer['gender']) transientCustomer.gender = customerMatch[0].gender
      if (!transientCustomer['mother_name']) transientCustomer.mother_name = customerMatch[0].mother_name
      if (!transientCustomer['deceased']) transientCustomer.deceased = customerMatch[0].deceased
      if (!transientCustomer['occupation']) transientCustomer.occupation = customerMatch[0].occupation
      if (!transientCustomer['income']) transientCustomer.income = customerMatch[0].income
      if (!transientCustomer['credit_risk']) transientCustomer.credit_risk = customerMatch[0].credit_risk
      if (!transientCustomer['company_token']) transientCustomer.company_token = companyToken
      
      customerIndexed.dataCustomer.customer = transientCustomer
      customerUpdate.push(customerIndexed.dataCustomer)
    }
  }
  console.timeEnd('separate')

  return { customerCreate, customerUpdate }
}

function setCustomerIdOnAddressList(customer = {}, customerId = 0) {
  const addressList = []
  for (let i in customer.address) {
    const a = customer.address[i]
    a.id_customer = customerId
    addressList.push(a)
  }

  return addressList
}

function setCustomerIdOnEmailList(customer = {}, customerId = 0) {
  const emailList = []
  for (let i in customer.email) {
    const e = customer.email[i]
    e.id_customer = customerId
    emailList.push(e)
  }

  return emailList
}

function setCustomerIdOnPhoneList (customer = {}, customerId = 0) {
  const phoneList = []
  for (let i in customer.phone) {
    const p = customer.phone[i]
    p.id_customer = customerId
    phoneList.push(p)
  }

  return phoneList
}

function setCustomerIdOnVehicleList (customer = {}, customerId = 0) {
  const vehicleList = []
  for (let i in customer.vehicle) {
    const v = customer.vehicle[i]
    v.id_customer = customerId
    vehicleList.push(v)
  }

  return vehicleList
}

function setCustomerIdOnBusinessPartnerList (customer = {}, customerId = 0) {
  const bpList = []
  for (let i in customer.business_partner) {
    const bp = customer.business_partner[i]
    bp.id_customer = customerId
    bpList.push(bp)
  }

  return bpList
}

async function organizeAdditionalInformationCustomer (customers = [], customerIdList = [], companyToken = '') {
  const addressList = []
  const emailList = []
  const phoneList = []
  const vehicleList = []
  const businessPartnerList = []

  console.time('organize')
  for (let indexCustomer in customers) {
    const c = customers[indexCustomer]
  
    const customerId = c.customer.id
    // console.log(customerId, c.customer.name)

    const customerAddressList = setCustomerIdOnAddressList(c, customerId)
    addressList.push(...customerAddressList)
    
    const customerEmailList = setCustomerIdOnEmailList(c, customerId)
    emailList.push(...customerEmailList)

    const customerPhoneList = setCustomerIdOnPhoneList(c, customerId)
    phoneList.push(...customerPhoneList)
    
    const customerVehicleList = setCustomerIdOnVehicleList(c, customerId)
    vehicleList.push(...customerVehicleList)

    const customerBusinessPartnerList = setCustomerIdOnBusinessPartnerList(c, customerId)
    businessPartnerList.push(...customerBusinessPartnerList)
  }
  console.timeEnd('organize')

  if (addressList.length) {
    console.time('persist address')
    await newAddress.persistBatch(addressList)
    console.timeEnd('persist address')
  }

  if (emailList.length) {
    console.time('persist email')
    await newEmail.persistBatch(emailList)
    console.timeEnd('persist email')
  }

  if (phoneList.length) {
    console.time('persist phone')
    await newPhone.persistBatch(phoneList)
    console.timeEnd('persist phone')
  }

  if (vehicleList.length) {
    console.time('persist vehicle')
    await newVehicle.persistBatch(vehicleList)
    console.timeEnd('persist vehicle')
  }

  if (businessPartnerList.length) {
    console.time('persist business partner')
    await newBusinessPartner.persistBatch(businessPartnerList)
    console.timeEnd('persist business partner')
  }

  return {
    addressList,
    emailList,
    phoneList,
    vehicleList,
    businessPartnerList
  }
}

async function persistNewCustomerList (customers = [], businessId = [], businessTemplateId = [], companyToken = '') {
  let customerIdList = []

  if (customers.length <= 0) return []

  const customerList = customers.map(c => {
    c.customer.company_token = companyToken
    c.customer.business_list = businessId
    c.customer.business_template_list = businessTemplateId
    return c.customer
  })
  customerIdList = await newCustomer.createBatch(customerList)
  customers.forEach((c, cIndex) => {
    c.customer.id = customerIdList[cIndex].id
  })

  await organizeAdditionalInformationCustomer(customers, customerIdList, companyToken)

  return customerIdList
}

async function updateExistCustomerList (customers = [], businessId = '', businessTemplateId = '', companyToken) {
  let customerIdList = []

  if (customers.length <= 0) return []

  const customerList = customers.map(c => c.customer)

  customerIdList = await newCustomer.updateBatch(customerList)
  
  await organizeAdditionalInformationCustomer(customers, customerIdList, companyToken)

  return customerIdList
}

async function schedulePersist(dataCustomers, companyToken, businessId, businessTemplateId, listKeyFields, prefixIndexElastic) {
  console.time('persist customer')
  let customers = []
  dataCustomers.forEach((data) => {
    let customer = builderCustomer.buildCustomer(data, companyToken)
    customers.push(customer)
  })

  try {
    let newCustomerIdList = []
    let updatedCustomerIdList = []

    if (isMultipleCustomers(customers)) {
      const persistQueue = new Queue(`persist-customer-business-${businessId}`, { redis: { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST }})
      persistQueue.add({ customers, companyToken, listKeyFields, businessId, businessTemplateId })

      processQueue(persistQueue)
      notifyProcessCompleted(persistQueue)

      return []
    } else {
      const customersSeparated = await separateBetweenUpdateOrCreate(customers, companyToken, translateFields(listKeyFields), businessId, businessTemplateId)
      newCustomerIdList = await persistNewCustomerList(customersSeparated.customerCreate, businessId, businessTemplateId, companyToken)
      updatedCustomerIdList = await updateExistCustomerList(customersSeparated.customerUpdate, businessId, businessTemplateId, companyToken)

      if (businessId.length) sendNotificationStorageCompleted(businessId[0], companyToken)

      newCustomerIdList.push(...updatedCustomerIdList)

      return newCustomerIdList[0].id
    }

    
  } catch (err) {
    console.log('SCHEDULE PERSIST =>', err)
    return err
  }
}

function isMultipleCustomers(customers = []) {
  return customers.length > 1
}

function processQueue(queue) {
  queue.process(async (job, done) => {
    const { customers, companyToken, listKeyFields, businessId, businessTemplateId } = job.data

    const customersSeparated = await separateBetweenUpdateOrCreate(customers, companyToken, translateFields(listKeyFields), businessId, businessTemplateId)
    await persistNewCustomerList(customersSeparated.customerCreate, businessId, businessTemplateId, companyToken)
    await updateExistCustomerList(customersSeparated.customerUpdate, businessId, businessTemplateId, companyToken)

    done(null, { businessId, companyToken })
  })
}

function notifyProcessCompleted(queue) {
  queue.on('completed', async (job, result) => {
    if (result.businessId) {
      await sendNotificationStorageCompleted(result.businessId[0], result.companyToken)
      await removeRedisKey(result.businessId)
    }
  })
}

async function removeRedisKey(businessId = '') {
  if (String(businessId).length) {
    const key = `bull:persist-customer-business-${businessId}*`
    return new Promise((resolve, reject) => {
      redisClient.scan(0, 'MATCH', key, (err, data) => {
        if (err) return reject(err)
        if (data[1]) {
          return Promise.all(
            data[1].map(
              entry =>
                new Promise((resolve, reject) =>
                  redisClient.del(entry, (err, data) => {
                    if (err) return reject(err)
                    return resolve(data)
                  })
                )
            )
          )
        }
        return resolve()
      })
    })
  }
}

module.exports = { schedulePersist, updateExistCustomerList }
