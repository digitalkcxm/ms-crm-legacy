const AddressController = require('../controllers/address-controller')

const addressController = new AddressController()

module.exports = (app) => {
  app.get('/api/v1/customers/:customerId/addresses', (req, res) => addressController.getAll(req, res)),
  app.post('/api/v1/customers/:customerId/addresses', (req, res) => addressController.create(req, res)),
  app.put('/api/v1/customers/:customerId/addresses/:addressId', (req, res) => addressController.update(req, res))
}