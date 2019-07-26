const customerService = require('../services/customer-service')

class CustomerController {
  async createBatch(req, res) {
    const businessId = req.body.business_id
    const userId = req.body.user_id
    const customers = req.body.customers

    await customerService.schedulePersist(customers, userId, businessId)

    res.status(201).send(req.body)
  }
}

module.exports = CustomerController