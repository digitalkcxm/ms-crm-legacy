const customerService = require('../services/customer-service')
const Customer = require('../models/customer')
const Email = require('../models/email')
const Phone = require('../models/phone')
const Address = require('../models/address')
const BusinessPartner = require('../models/business-partner')
const Vehicle = require('../models/vehicle')
const { buildCustomerDTO } = require('../lib/builder-customer-dto')
const builderCustomer = require('../lib/builder-customer')
const { calcExpireTime } = require('../helpers/util')
const { AggregateModeType } = require('../models/aggregate-mode-enum')

const newCustomer = new Customer()
const newEmail = new Email()
const newPhone = new Phone()
const newAddress = new Address()
const newBusinessPartner = new BusinessPartner()
const newVehicle = new Vehicle()

class CustomerController {
  async createBatch(req, res) {
    const customers = req.body.customers
    const businessId = req.body.business_id
    const businessTemplateId = req.body.business_template_id
    const listKeyFields = req.body.field_key_list
    const prefixIndexElastic = req.body.prefix_index_elastic
    const aggregateMode = req.body.aggregate_mode ? req.body.aggregate_mode : 'increment'

    const companyToken = req.headers['token']

    if (companyToken.length === 0) return res.status(500).send({ err: 'Company Token inválido.' })

    try {
      const resultPersistCustomers = await customerService.schedulePersist(
        customers,
        companyToken,
        [businessId],
        [businessTemplateId],
        listKeyFields,
        aggregateMode,
        prefixIndexElastic
      )
      const resultBody = req.body
      resultBody.contact_ids = resultPersistCustomers

      await this._invalidateCustomerCache(companyToken)

      res.status(201).send(resultBody)
    } catch (err) {
      console.error('CREATE BATCH CUSTOMER ==>', err)
      return res.status(500).send({ error: 'Erro ao salvar os dados do customer' })
    }
  }

  async _invalidateCustomerCache(companyToken = '') {
    const prefixCacheKey = `${companyToken}`

    const customerCacheKeys = Object.keys(global.cache.customerList)
    for (let i = 0; i < customerCacheKeys.length; i++) {
      const cacheKey = customerCacheKeys[i]
      if (cacheKey.indexOf(prefixCacheKey) >= 0) {
        global.cache.customerList[cacheKey] = null
      }
    }

    console.info(`Invalid cache from key ${prefixCacheKey}`)
  }

  async create(req, res) {
    req.assert('customer_cpfcnpj', 'O CPF/CNPJ é obrigatório').notEmpty()
    req.assert('prefix_index_elastic', 'O prefix index elastic é obrigatório').notEmpty()

    if (req.validationErrors()) return res.status(500).send({ errors: req.validationErrors() })

    const companyToken = req.headers['token']

    if (companyToken.length === 0) return res.status(500).send({ err: 'Company Token inválido.' })

    try {
      const customer = await newCustomer.getByCpfCnpj(req.body.customer_cpfcnpj, companyToken)
      if (customer) return res.status(400).send({ err: 'Já existe um cadastro com este CPF/CNPJ.' })

      const prefixIndexElastic = req.body.prefix_index_elastic
      const customers = [req.body]
      const templateListId = []
      const businessLIstId = []
      const listKeyFields = ['customer_cpfcnpj']

      const customerId = await customerService.schedulePersist(
        customers,
        companyToken,
        templateListId,
        businessLIstId,
        listKeyFields,
        prefixIndexElastic
      )

      const result = {}
      Object.keys(req.body)
        .filter((k) => k !== 'prefix_index_elastic')
        .forEach((k) => {
          result[k] = req.body[k]
        })

      result.customer_id = customerId

      await this._invalidateCustomerCache(companyToken)

      res.status(201).send(result)
    } catch (err) {
      console.error('CREATE SINGLE CUSTOMER ==>', err)
      return res.status(500).send({ error: 'Erro ao criar um single customer' })
    }
  }

  async search(req, res) {
    const companyToken = req.headers['token']

    const { search } = req.query
    if (!Object.keys(req.query).includes('search')) return res.status(400).send({ error: 'O parâmetro search é obrigatório.' })
    else if (search.trim().length < 3)
      return res.status(400).send({ warn: 'Para realizar a pesquisa é necessário informar ao menos 3 caracteres' })

    const templateId = req.query.template_id

    try {
      let customers = []
      let customers_ids = []

      customers = await newCustomer.searchCustomerByNameCpfEmailPhone(search, companyToken, templateId)

      const customerListIndexed = {}
      for (let i in customers) {
        const customer = customers[i]
        customerListIndexed[customer.id] = customer
      }

      customers_ids = Object.keys(customerListIndexed)

      const phoneListIndexed = {}
      const emailListIndexed = {}

      const list_phones = await newPhone.listAllByCustomers(customers_ids)
      const list_emails = await newEmail.listAllByCustomers(customers_ids)

      for (let i in list_phones) {
        const phone = list_phones[i]
        if (!phoneListIndexed[phone.id_customer]) phoneListIndexed[phone.id_customer] = []

        phoneListIndexed[phone.id_customer].push({
          number: phone.number,
          type: phone.type
        })
      }

      for (let i in list_emails) {
        const email = list_emails[i]
        if (!emailListIndexed[email.id_customer]) emailListIndexed[email.id_customer] = []

        emailListIndexed[email.id_customer].push({ email: email.email })
      }

      const customersResult = []

      for (let indexCustomerId in customers_ids) {
        const cid = customers_ids[indexCustomerId]
        const customerCache = customerListIndexed[cid]

        if (customerCache) {
          customerCache.customer_phome = phoneListIndexed[cid] ? phoneListIndexed[cid] : []
          customerCache.customer_email = emailListIndexed[cid] ? emailListIndexed[cid] : []

          customersResult.push(customerCache)
        }
      }

      return res.status(200).send(customersResult)
    } catch (err) {
      console.error(err)
      return res.status(500).send({ err: err.message })
    }
  }

  async searchFormatted(req, res) {
    const companyToken = req.headers['token']

    const { search } = req.query
    if (!Object.keys(req.query).includes('search')) return res.status(400).send({ error: 'O parâmetro search é obrigatório.' })
    else if (search.trim().length === 0) return res.status(204).send([])

    let page = -1
    let limit = 10
    if (req.query.page) page = parseInt(req.query.page)
    if (req.query.limit) limit = parseInt(req.query.limit)

    const templateId = req.query.template_id

    try {
      let customers = []
      let customers_ids = []

      const searchResult = await newCustomer.searchCustomerFormattedByNameCpfEmailPhone(search, companyToken, templateId, page, limit)

      const customerListIndexed = {}
      for (let i in searchResult.customers) {
        const customer = searchResult.customers[i]
        customerListIndexed[customer.id] = customer
      }

      customers_ids = Object.keys(customerListIndexed)

      const phoneListIndexed = {}
      const emailListIndexed = {}

      const list_phones = await newPhone.listAllByCustomers(customers_ids)
      const list_emails = await newEmail.listAllByCustomers(customers_ids)

      for (let i in list_phones) {
        const phone = list_phones[i]
        if (!phoneListIndexed[phone.id_customer]) phoneListIndexed[phone.id_customer] = []

        phoneListIndexed[phone.id_customer].push({
          number: phone.number,
          type: phone.type
        })
      }

      for (let i in list_emails) {
        const email = list_emails[i]
        if (!emailListIndexed[email.id_customer]) emailListIndexed[email.id_customer] = []

        emailListIndexed[email.id_customer].push({ email: email.email })
      }

      const customersResult = []

      for (let indexCustomerId in customers_ids) {
        const cid = customers_ids[indexCustomerId]
        const customerCache = customerListIndexed[cid]

        if (customerCache) {
          customerCache.phone = phoneListIndexed[cid] ? phoneListIndexed[cid] : []
          customerCache.email = emailListIndexed[cid] ? emailListIndexed[cid] : []

          customersResult.push(customerCache)
        }
      }

      return res.status(200).send({
        customers: customersResult,
        pagination: searchResult.pagination
      })
    } catch (err) {
      console.error(err)
      return res.status(500).send({ err: err.message })
    }
  }

  async getById(req, res) {
    const companyToken = req.headers['token']

    try {
      const customer = await newCustomer.getById(req.params.id, companyToken)
      if (customer) {
        customer.email = await newEmail.getAllByCustomer(customer.id)
        customer.address = await newAddress.getAllByCustomer(customer.id)
        customer.phone = await newPhone.getAllByCustomer(customer.id)
        customer.business_partner = await newBusinessPartner.getAllByCustomer(customer.id)
        customer.vehicle = await newVehicle.getAllByCustomer(customer.id)
      }
      return res.status(200).send(customer)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async getByIdFormatted(req, res) {
    const companyToken = req.headers['token']

    try {
      let customer = await newCustomer.getById(req.params.id, companyToken)
      if (customer) {
        customer.email = await newEmail.getAllByCustomer(customer.id)
        customer.address = await newAddress.getAllByCustomer(customer.id)
        customer.phone = await newPhone.getAllByCustomer(customer.id)
        customer.business_partner = await newBusinessPartner.getAllByCustomer(customer.id)
        customer.vehicle = await newVehicle.getAllByCustomer(customer.id)
      }

      customer = buildCustomerDTO(customer)

      return res.status(200).send(customer)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async getByCpfCnpj(req, res) {
    const companyToken = req.headers['token']

    try {
      const customer = await newCustomer.getByCpfCnpj(req.query.cpfcnpj, companyToken)
      if (customer) {
        customer.email = await newEmail.getAllByCustomer(customer.id)
        customer.address = await newAddress.getAllByCustomer(customer.id)
        customer.phone = await newPhone.getAllByCustomer(customer.id)
        customer.business_partner = await newBusinessPartner.getAllByCustomer(customer.id)
        customer.vehicle = await newVehicle.getAllByCustomer(customer.id)
      }

      return res.status(200).send(customer)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async getPoolByCpfCnpj(req, res) {
    const companyToken = req.headers['token']

    try {
      const emailPhoneIndexed = {}
      const customers = await newCustomer.getPoolByCpfCnpj(req.body.cpfcnpj_list, companyToken)
      console.log('customers', customers.length)
      const customerIdList = customers.map((customer) => customer.id)
      const emails = await newEmail.listAllByCustomers(customerIdList)
      const phones = await newPhone.listAllByCustomers(customerIdList)
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i]
        let dataIndexed = emailPhoneIndexed[email.id_customer]
        if (!dataIndexed) {
          dataIndexed = { emails: [], phones: [] }
        }
        dataIndexed.emails.push(email)
        emailPhoneIndexed[email.id_customer] = dataIndexed
      }
      for (let i = 0; i < phones.length; i++) {
        const phone = phones[i]
        let dataIndexed = emailPhoneIndexed[phone.id_customer]
        if (!dataIndexed) {
          dataIndexed = { emails: [], phones: [] }
        }
        dataIndexed.phones.push(phone)
        emailPhoneIndexed[phone.id_customer] = dataIndexed
      }

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i]
        const dataIndexed = emailPhoneIndexed[customer.id]
        if (dataIndexed && dataIndexed.emails) {
          customer.email = dataIndexed.emails
        }
        if (dataIndexed && dataIndexed.phones) {
          customer.phone = dataIndexed.phones
        }
        customers[i] = customer
      }

      return res.status(200).send(customers)
    } catch (err) {
      console.error(err)
      return res.status(500).send({
        err: 'Ocorreu erro ao tentar buscar os dados de uma lista de clientes.'
      })
    }
  }

  async getPoolById(req, res) {
    const companyToken = req.headers['token']
    const customersIds = req.body.customer_ids

    try {
      const emailPhoneIndexed = {}
      const customers = await newCustomer.getByListId(customersIds, companyToken)
      console.log('customers', customers.length)
      const customerIdList = customers.map((customer) => customer.id)
      const emails = await newEmail.listAllByCustomers(customerIdList)
      const phones = await newPhone.listAllByCustomers(customerIdList)
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i]
        let dataIndexed = emailPhoneIndexed[email.id_customer]
        if (!dataIndexed) {
          dataIndexed = { emails: [], phones: [] }
        }
        dataIndexed.emails.push(email)
        emailPhoneIndexed[email.id_customer] = dataIndexed
      }
      for (let i = 0; i < phones.length; i++) {
        const phone = phones[i]
        let dataIndexed = emailPhoneIndexed[phone.id_customer]
        if (!dataIndexed) {
          dataIndexed = { emails: [], phones: [] }
        }
        dataIndexed.phones.push(phone)
        emailPhoneIndexed[phone.id_customer] = dataIndexed
      }

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i]
        const dataIndexed = emailPhoneIndexed[customer.id]
        if (dataIndexed && dataIndexed.emails) {
          customer.email = dataIndexed.emails
        }
        if (dataIndexed && dataIndexed.phones) {
          customer.phone = dataIndexed.phones
        }
        customers[i] = customer
      }

      return res.status(200).send(customers)
    } catch (err) {
      console.error(err)
      return res.status(500).send({
        err: 'Ocorreu erro ao tentar buscar os dados de uma lista de clientes pelo ID.'
      })
    }
  }

  async getAllByCompany(req, res) {
    const companyToken = req.headers.token
    const templateId = req.headers.templateid ? req.headers.templateid : ''
    let page = -1
    let limit = 10
    if (req.query.page) page = parseInt(req.query.page)
    if (req.query.limit) limit = parseInt(req.query.limit)

    const cacheKey = `${companyToken}:${templateId}:${page}:${limit}`

    try {
      if (global.cache.customerList[cacheKey]) {
        const customerListCached = global.cache.customerList[cacheKey]
        if (
          customerListCached &&
          customerListCached.expire &&
          calcExpireTime(new Date(), customerListCached.expire) < global.cache.default_expire
        ) {
          // console.log('CUSTOMER_LIST_CACHED')
          // return res.status(200).send(customerListCached.data)
        } else {
          global.cache.customerList[cacheKey] = null
        }
      }

      let listCustomers = []
      let { customers, pagination } = await newCustomer.getAllByCompany(companyToken, page, limit, templateId)

      const customerIdList = []
      for (const i in customers) {
        const customer = customers[i]
        customerIdList.push(customer.id)
      }

      const phoneList = await newPhone.listAllByCustomers(customerIdList)
      const emailList = await newEmail.listAllByCustomers(customerIdList)

      const phoneListIndexed = {}
      const emailListIndexed = {}
      for (const i in phoneList) {
        const phone = phoneList[i]
        if (!phoneListIndexed[phone.id_customer]) phoneListIndexed[phone.id_customer] = []

        phoneListIndexed[phone.id_customer].push({
          id: phone.id,
          number: phone.number,
          type: phone.type,
          created_at: phone.created_at,
          updated_at: phone.updated_at
        })
      }

      for (const i in emailList) {
        const email = emailList[i]
        if (!emailListIndexed[email.id_customer]) emailListIndexed[email.id_customer] = []

        emailListIndexed[email.id_customer].push({
          id: email.id,
          email: email.email,
          created_at: email.created_at,
          updated_at: email.updated_at
        })
      }

      for (const i in customers) {
        const customer = customers[i]
        customer.email = emailListIndexed[customer.id] ? emailListIndexed[customer.id] : []
        customer.phone = phoneListIndexed[customer.id] ? phoneListIndexed[customer.id] : []

        listCustomers.push(customer)
      }

      global.cache.customerList[cacheKey] = {
        data: { customers: listCustomers, pagination },
        expire: new Date()
      }
      console.log('CUSTOMER_LIST_STORED')

      return res.status(200).send({ customers: listCustomers, pagination })
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async update(req, res) {
    const companyToken = req.headers['token']

    const customerId = req.params.id
    if (!customerId) return res.status(400).send({ error: 'O ID do customer é obrigatório' })

    try {
      const customer = await newCustomer.getById(req.params.id, companyToken)
      if (!customer) return res.status(400).send({ err: 'Customer não encontrado.' })

      const customerUpdate = req.body
      customerUpdate.customer_cpfcnpj = customer.cpfcnpj
      const customers = []
      customers.push(builderCustomer.buildCustomer(customerUpdate, companyToken))
      customers[0].id = parseInt(customerId)
      customers[0].business_list = customer.business_list
      customers[0].business_template_list = customer.business_template_list
      customers[0].customer.id = parseInt(customerId)
      customers[0].customer.business_list = customer.business_list
      customers[0].customer.business_template_list = customer.business_template_list

      if (customerUpdate.customer_phone || customerUpdate.customer_email) {
        await customerService.updateExistCustomerList(customers, null, null, companyToken, AggregateModeType.REPLACE)
      } else {
        await customerService.updateExistCustomerList(customers, null, null, companyToken)
      }

      return res.sendStatus(204)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async updateCPC(req, res) {
    const companyToken = req.headers['token']

    const cpfcnpj = req.body.cpfcnpj
    const contact = req.body.contact
    const contactType = req.body.contact_type
    const userId = req.body.user_id
    const username = req.body.username
    const updatedAt = req.body.updated_at
    const cpc = req.body.cpc

    try {
      const customer = await newCustomer.getCustomerByCpfCnpj(cpfcnpj, companyToken)
      if (!customer) return res.status(400).send({ err: 'Customer não encontrado.' })

      if (contactType === 'phone_number') {
        const phone = await newPhone.getByNumber(customer.id, contact)
        if (!phone) {
          return res.status(400).send({ err: 'o telefone não foi encontrado para o customer' })
        }
        await newPhone.insertCPC(customer.id, phone.id, cpc, userId, username, updatedAt)
      } else if (contactType === 'email') {
        const email = await newEmail.getByEmail(customer.id, contact)
        if (!email) {
          return res.status(400).send({ err: 'o email não foi encontrado para o customer' })
        }
        await newEmail.insertCPC(customer.id, email.id, cpc, userId, username, updatedAt)
      } else if (contactType === 'address') {
        // TODO: falta implementar
      } else {
        return res.status(400).send({ err: 'o contact_type não é permitido' })
      }

      return res.sendStatus(204)
    } catch (err) {
      console.error(err)
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = CustomerController
