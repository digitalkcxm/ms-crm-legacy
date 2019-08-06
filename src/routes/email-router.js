const EmailController = require('../controllers/email-controller')

const emailController = new EmailController()

module.exports = (app) => {
  app.post('/api/v1/customers/:customerId/emails', (req, res) => emailController.create(req, res))
}