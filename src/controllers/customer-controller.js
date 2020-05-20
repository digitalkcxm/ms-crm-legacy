const customerService = require('../services/customer-service')
const Customer = require('../models/customer')
const Email = require('../models/email')
const Phone = require('../models/phone')
const Address = require('../models/address')
const BusinessPartner = require('../models/business-partner')
const Vehicle = require('../models/vehicle')
const { buildCustomerDTO } = require('../lib/builder-customer-dto')
const builderCustomer = require('../lib/builder-customer')

const newCustomer = new Customer()
const newEmail = new Email()
const newPhone = new Phone()
const newAddress = new Address()
const newBusinessPartner = new BusinessPartner()
const newVehicle = new Vehicle()

class CustomerController {
  async createBatch(req, res) {
    const customers = req.body.customers
    const businessId  = req.body.business_id
    const businessTemplateId = req.body.business_template_id
    const listKeyFields = req.body.field_key_list
    const prefixIndexElastic = req.body.prefix_index_elastic

    const companyToken = req.headers['token']
    
    if (companyToken.length === 0) return res.status(500).send({ err: "Company Token inválido." })

    try {
      const resultPersistCustomers = await customerService.schedulePersist(customers, companyToken, [businessId], [businessTemplateId], listKeyFields, prefixIndexElastic)
      const resultBody = req.body
      resultBody.contact_ids = resultPersistCustomers
      
      res.status(201).send(resultBody)
    } catch (err) {
      console.error('CREATE BATCH CUSTOMER ==>', err)
      return res.status(500).send({ error: 'Erro ao salvar os dados do customer' })
    }
  }

  async create(req, res) {
    req.assert('customer_cpfcnpj', 'O CPF/CNPJ é obrigatório').notEmpty()
    req.assert('prefix_index_elastic', 'O prefix index elastic é obrigatório').notEmpty()
    
    if (req.validationErrors()) return res.status(500).send({ errors: req.validationErrors() })

    const companyToken = req.headers['token']

    if (companyToken.length === 0) return res.status(500).send({ err: "Company Token inválido." })

    try {
      const customer = await newCustomer.getByCpfCnpj(req.body.customer_cpfcnpj, companyToken)
      if (customer) return res.status(400).send({ err: "Já existe um cadastro com este CPF/CNPJ." })

      const prefixIndexElastic = req.body.prefix_index_elastic
      const customers = [req.body]
      const templateListId = []
      const businessLIstId = []
      const listKeyFields = ['customer_cpfcnpj']
      
      const customerId = await customerService.schedulePersist(customers, companyToken, templateListId, businessLIstId, listKeyFields, prefixIndexElastic)

      const result = {}
      Object.keys(req.body).filter(k => k !== 'prefix_index_elastic')
        .forEach(k => {
          result[k] = req.body[k]
        })

      result.customer_id = customerId

      res.status(201).send(result)
    } catch (err) {
      console.error('CREATE SINGLE CUSTOMER ==>', err)
      return res.status(500).send({ error: 'Erro ao criar um single customer' })
    }
  }

  async search (req, res) {
    const companyToken = req.headers['token']
    
    const { search } = req.query
    if (!Object.keys(req.query).includes('search')) return res.status(400).send({ error: 'O parâmetro search é obrigatório.' })
    else if (search.trim().length === 0) return res.status(204).send([])

    try {
      let customers = []
      let customers_ids = []
      let list_customers = []
      
      console.time('search customer')
      customers = await newCustomer.searchCustomerByNameCpfEmailPhone(search, companyToken)
      console.timeEnd('search customer')

      const customerListIndexed = {}
      for (let i in customers) {
        const customer = customers[i]
        customerListIndexed[customer.id] = customer
      }
      list_customers = customers
      customers_ids = Object.keys(customerListIndexed)

      const phoneListIndexed = {}
      const emailListIndexed = {}
      
      const list_phones = await newPhone.listAllByCustomers(customers_ids)
      const list_emails = await newEmail.listAllByCustomers(customers_ids)

      for (let i in list_phones) {
        const phone = list_phones[i]
        if (!phoneListIndexed[phone.id_customer]) phoneListIndexed[phone.id_customer] = []

        phoneListIndexed[phone.id_customer].push({ number: phone.number, type: phone.type })
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
          customerCache.customer_phome = (phoneListIndexed[cid]) ? phoneListIndexed[cid] : []
          customerCache.customer_email = (emailListIndexed[cid]) ? emailListIndexed[cid] : []
          
          customersResult.push(customerCache)
        }
      }
      
      return res.status(200).send(customersResult)
    } catch (err) {
      console.error(err)
      return res.status(500).send({ err: err.message })
    }
  }

  async getById (req, res) {
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

  async getByIdFormatted (req, res) {
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

  async getByCpfCnpj (req, res) {
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

  async getAllByCompany(req, res) {
    const companyToken = req.headers['token']
    let page = -1
    let limit = 10
    if (req.query.page) page = parseInt(req.query.page)
    if (req.query.limit) limit = parseInt(req.query.limit)

    try {
      let listCustomers = []
      let { customers, pagination } = await newCustomer.getAllByCompany(companyToken, page, limit)
      listCustomers = await Promise.all(customers.map(async el => {
        let customer = el
        customer.email = await newEmail.getAllByCustomer(customer.id)
        customer.phone = await newPhone.getAllByCustomer(customer.id)
        return customer
      }))

      return res.status(200).send({ customers: listCustomers, pagination })
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async update (req, res) {
    const companyToken = req.headers['token']
    const prefixIndexElastic = req.headers['prefix-index-elastic']

    const customerId = req.params.id
    if (!customerId) return res.status(400).send({ error: 'O ID do customer é obrigatório' })

    try {
      const customer = await newCustomer.getById(req.params.id, companyToken)
      if (!customer) return req.status(400).send({ err: "Customer não encontrado." })

      const customerUpdate = req.body
      customerUpdate.customer_cpfcnpj = customer.cpfcnpj
      const customers = []
      customers.push(builderCustomer.buildCustomer(customerUpdate, companyToken))
      customers[0].id = parseInt(customerId)
      customers[0].customer.id = parseInt(customerId)
      
      await customerService.updateExistCustomerList(customers, null, null, companyToken)
      
      return res.sendStatus(204)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = CustomerController
