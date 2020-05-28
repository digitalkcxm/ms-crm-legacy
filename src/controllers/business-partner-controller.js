const moment = require('moment')

const Customer = require('../models/customer')
const BusinessPartner = require('../models/business-partner')

const customerModel = new Customer()
const businessPartnerModel = new BusinessPartner()

class BusinessPartnerController {
  async create (req, res) {
    req.assert('cnpj', 'O CNPJ é obrigatório').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['company_token']

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      await businessPartnerModel.createOrUpdate(customerId, req.body)

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

    let bpId = req.params.businessPartnerId
    if (!bpId) return res.status(400).send({ error: "O ID do business partner é obrigatório." })
    else bpId = parseInt(bpId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })
      
      await businessPartnerModel.update(customerId, bpId, req.body)

      const bp = await businessPartnerModel.getById(bpId, customerId)
      
      return res.status(200).send(bp)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async getAll (req, res) {
    const companyToken = req.headers['company_token']

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      const partners = await businessPartnerModel.getAllByCustomer(customerId)
      
      return res.status(200).send(partners)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = BusinessPartnerController