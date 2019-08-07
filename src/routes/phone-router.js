const PhoneController = require('../controllers/phone-controller')

const phoneController = new PhoneController()

module.exports = (app) => {
  app.get('/api/v1/customers/:customerId/phones', (req, res) => phoneController.getAll(req, res)),
  app.post('/api/v1/customers/:customerId/phones', (req, res) => phoneController.create(req, res)),
  app.put('/api/v1/customers/:customerId/phones/:phoneId', (req, res) => phoneController.update(req, res))
}