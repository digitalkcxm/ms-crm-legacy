const customerService = require('../services/customer-service')
const Customer = require('../models/customer')
const Email = require('../models/email')
const Phone = require('../models/phone')
const Address = require('../models/address')
const BusinessPartner = require('../models/business-partner')
const Vehicle = require('../models/vehicle')

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

    const companyToken = req.headers['token']

    if (companyToken.length === 0) return res.status(500).send({ err: "Company Token inválido." })

    await customerService.schedulePersist(customers, companyToken, [businessId], [businessTemplateId])

    res.status(201).send(req.body)
  }

  async create(req, res) {
    req.assert('customer_cpfcnpj', 'O CPF/CNPJ é obrigatório').notEmpty()
    const companyToken = req.headers['token']

    if (companyToken.length === 0) return res.status(500).send({ err: "Company Token inválido." })

    var customer = await newCustomer.getByCpfCnpj(req.body.customer_cpfcnpj, companyToken)
    if (customer) return res.status(400).send({ err: "Já existe um cadastro com este CPF/CNPJ." })
    
    try {
      const customers = [req.body]
      await customerService.schedulePersist(customers, companyToken, [], [])

      res.status(201).send(req.body)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async getByCpfCnpj (req, res) {
    const companyToken = req.headers['token']

    try {
      var customer = await newCustomer.getByCpfCnpj(req.query.cpfcnpj, companyToken)
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

    try {
      var listCustomers = []
      var customers = await newCustomer.getAllByCompany(companyToken)
      var listCustomers = await Promise.all(customers.map(async el => {
        var customer = el
        customer.email = await newEmail.getAllByCustomer(customer.id)
        customer.phone = await newPhone.getAllByCustomer(customer.id)
        return customer
      }))

      return res.status(200).send(listCustomers)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async update (req, res) {
    const companyToken = req.headers['token']

    try {
      const customer = await newCustomer.getById(req.params.id, companyToken)
      if (!customer) return req.status(400).send({ err: "Customer não encontrado." })

      var customerUpdate = req.body
      customerUpdate.customer_cpfcnpj = customer.cpfcnpj
      const customers = [customerUpdate]
      
      await customerService.schedulePersist(customers, companyToken, [], [])
      
      return res.sendStatus(200)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = CustomerController