const customerService = require('../services/customer-service')
const Customer = require('../models/customer')
const Email = require('../models/email')
const Phone = require('../models/phone')
const Address = require('../models/address')
const BusinessPartner = require('../models/business-partner')
const Vehicle = require('../models/vehicle')
const { searchCustomer } = require('../helpers/elastic')
const { buildCustomerDTO } = require('../lib/builder-customer-dto')

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
    const prefixIndexElastic = req.headers['prefix-index-elastic']

    const { search } = req.query
    if (!Object.keys(req.query).includes('search')) return res.status(400).send({ error: 'O parâmetro search é obrigatório.' })
    else if (search.trim().length === 0) return res.status(204).send([])

    try {
      const result = await searchCustomer(search, prefixIndexElastic)
      let customers = []
      let customers_ids = []
      let list_customers = []
      if (result && result.length > 0) customers = result.map(r => r._source.doc)
      
      if (customers.length > 0)  {
        customers.push(customers[0])
        customers_ids = customers.map(c => c.id).filter((value, index, self) => self.indexOf(value) === index)
        list_customers = await newCustomer.listById(customers_ids, companyToken)
      } else {
        customers = await newCustomer.searchCustomerByNameCpfEmailPhone(search, companyToken)
        list_customers = customers
        customers_ids = customers.map(c => c.id)
      }
      
      const list_phones = await newPhone.listAllByCustomers(customers_ids)
      const list_emails = await newEmail.listAllByCustomers(customers_ids)
      let customersResult = []
      customers_ids.forEach(cid => {
        const customerCache = customers.find(c => c.id == cid)
        const customer1 = list_customers.find(cus => cus.id == cid)
        if (customer1) {
          if (!customerCache.customer_name) delete customerCache.customer_name
          customerCache.customer_phome = list_phones.filter(p => p.id_customer === customerCache.id).map(p => { return { number: p.number, type: p.type } })
          customerCache.customer_email = list_emails.filter(e => e.id_customer === customerCache.id).map(e => { return { email: e.email } })
          customerCache.business_list = customer1.business_list
          customerCache.business_template_list = customer1.business_template_list

          customersResult.push(customerCache)
        }
      })

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

    try {
      const customer = await newCustomer.getById(req.params.id, companyToken)
      if (!customer) return req.status(400).send({ err: "Customer não encontrado." })

      const customerUpdate = req.body
      customerUpdate.customer_cpfcnpj = customer.cpfcnpj
      const customers = [customerUpdate]
      
      await customerService.schedulePersist(customers, companyToken, [], [], [], prefixIndexElastic)
      
      return res.sendStatus(204)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = CustomerController
