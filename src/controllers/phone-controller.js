const Customer = require('../models/customer')
const Phone = require('../models/phone')

const customerModel = new Customer()
const phoneModel = new Phone()

class PhoneController {
  async create (req, res) {
    req.assert('number', 'O número é obrigatório').notEmpty()
    req.assert('type', 'O tipo é obrigatório').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['company_token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer && !customer.length > 0) return res.status(500).send({ err: "Customer não encontrado." })

      const { number, type } = req.body

      const phone = await phoneModel.createOrUpdate(req.params.customerId, { number, type })
      
      return res.sendStatus(201)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async getAll (req, res) {
    const companyToken = req.headers['company_token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      const phones = await phoneModel.getAllByCustomer(req.params.customerId)
      return res.status(200).send(phones)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async update (req, res) {
    req.assert('number', 'O número é obrigatório').notEmpty()
    req.assert('type', 'O tipo é obrigatório').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['company_token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer) return res.status(400).send({ err: "Customer não encontrado." })

      const { number, type } = req.body

      const phone = await phoneModel.update(req.params.customerId, req.params.phoneId, { number, type })
      if (!phone) return res.status(400).send({ err: "Phone não encontrado." })
      
      return res.status(200).send(phone)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = PhoneController