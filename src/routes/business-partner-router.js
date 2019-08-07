const BusinessPartnerController = require('../controllers/business-partner-controller')

const businessPartnerController = new BusinessPartnerController()

module.exports = (app) => {
  app.get('/api/v1/customers/:customerId/business_partners', (req, res) => businessPartnerController.getAll(req, res)),
  app.post('/api/v1/customers/:customerId/business_partners', (req, res) => businessPartnerController.create(req, res)),
  app.put('/api/v1/customers/:customerId/business_partners/:businessPartnerId', (req, res) => businessPartnerController.update(req, res))
}