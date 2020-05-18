const Address = require('../models/address')
const Customer = require('../models/customer')

const addressModel = new Address()
const customerModel = new Customer()

class AddressController {
  async create (req, res) {
    req.assert('street', 'A rua é obrigatória').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['company_token']

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      await addressModel.createOrUpdate(customerId, req.body)

      return res.sendStatus(201)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async update (req, res) {
    const companyToken = req.headers['company_token']

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    let addressId = req.params.addressId
    if (!addressId) return res.status(400).send({ error: "O ID do address é obrigatório." })
    else addressId = parseInt(addressId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      await addressModel.update(customerId, addressId, req.body)

      const address = await addressModel.getById(addressId, customerId)

      return res.status(200).send(address)
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