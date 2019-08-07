const EmailController = require('../controllers/email-controller')

const emailController = new EmailController()

module.exports = (app) => {
  app.post('/api/v1/customers/:customerId/emails', (req, res) => emailController.create(req, res)),
  app.get('/api/v1/customers/:customerId/emails', (req, res) => emailController.getAll(req, res)),
  app.put('/api/v1/customers/:customerId/emails/:emailId', (req, res) => emailController.update(req, res))
}