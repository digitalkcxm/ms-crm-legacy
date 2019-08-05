const customerService = require('../services/customer-service')

class CustomerController {
  async createBatch(req, res) {
    const customers = req.body.customers

    const companyToken = req.headers['company_token']

    if (companyToken.length === 0) return res.status(500).send({ err: "Company Token inválido." })

    await customerService.schedulePersist(customers, companyToken)

    res.status(201).send(req.body)
  }
}

module.exports = CustomerController