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

    const companyToken = req.headers['token']

    if (companyToken.length === 0) return res.status(500).send({ err: "Company Token inválido." })

    await customerService.schedulePersist(customers, companyToken)

    res.status(201).send(req.body)
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

  async update (req, res) {
    const companyToken = req.headers['token']

    try {
      const customer = await newCustomer.getById(req.params.id, companyToken)
      if (!customer) return req.status(400).send({ err: "Customer não encontrado." })
      var dataCustomer = {}
      if (req.body.name) dataCustomer.name = req.body.name
      if (req.body.birthdate) dataCustomer.birthdate = req.body.birthdate
      if (req.body.gender) dataCustomer.gender = req.body.gender
      if (req.body.mother_name) dataCustomer.mother_name = req.body.mother_name
      if (req.body.deceased) dataCustomer.deceased = req.body.deceased
      if (req.body.occupation) dataCustomer.occupation = req.body.occupation
      if (req.body.income) dataCustomer.income = req.body.income
      if (req.body.credit_risk) dataCustomer.credit_risk = req.body.credit_risk
      
      await newCustomer.update(customer.id, dataCustomer)

      return res.sendStatus(200)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = CustomerController