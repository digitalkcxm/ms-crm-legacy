const CustomerController = require('../controllers/customer-controller')

const customerController = new CustomerController()

module.exports = (app) => {
  app.post('/api/v1/customers', (req, res) => customerController.createBatch(req, res))
}