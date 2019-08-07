const Address = require('../models/address')
const Customer = require('../models/customer')

const addressModel = new Address()
const customerModel = new Customer()

class AddressController {
  async create (req, res) {
    req.assert('street', 'A rua é obrigatória').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['company_token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      await addressModel.createOrUpdate(req.params.customerId, req.body)
      return res.sendStatus(201)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async update (req, res) {
    const companyToken = req.headers['company_token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      await addressModel.update(req.params.customerId, req.params.addressId, req.body)
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

      const addresses = await addressModel.getAllByCustomer(req.params.customerId)
      return res.status(200).send(addresses)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = AddressController