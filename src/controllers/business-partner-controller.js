const Customer = require('../models/customer')
const BusinessPartner = require('../models/business-partner')

const customerModel = new Customer()
const businessPartnerModel = new BusinessPartner()

class BusinessPartnerController {
  async create (req, res) {
    req.assert('cnpj', 'O CNPJ é obrigatório').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['company_token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })
      await businessPartnerModel.createOrUpdate(req.params.customerId, req.body)

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
      
      const businessPartner = await businessPartnerModel.update(req.params.customerId, req.params.businessPartnerId, req.body)
      if (!businessPartner) return res.status(400).send({ err: "Business partner não encontrado." })

      return res.status(200).send(businessPartner)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async getAll (req, res) {
    const companyToken = req.headers['company_token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })
      const partners = await businessPartnerModel.getAllByCustomer(req.params.customerId)

      return res.status(200).send(partners)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = BusinessPartnerController