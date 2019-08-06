const CustomerController = require('../controllers/customer-controller')

const customerController = new CustomerController()

module.exports = (app) => {
  app.post('/api/v1/customers', (req, res) => customerController.createBatch(req, res)),
  app.get('/api/v1/customers', (req, res) => customerController.getByCpfCnpj(req, res)),
  app.put('/api/v1/customers/:id', (req, res) => customerController.update(req, res))
}