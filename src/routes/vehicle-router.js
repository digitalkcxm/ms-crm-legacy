const VehicleController = require('../controllers/vehicle-controller')

const vehicleController = new VehicleController()

module.exports = (app) => {
  app.get('/api/v1/customers/:customerId/vehicles', (req, res) => vehicleController.getAll(req, res)),
  app.post('/api/v1/customers/:customerId/vehicles', (req, res) => vehicleController.create(req, res)),
  app.put('/api/v1/customers/:customerId/vehicles/:vehicleId', (req, res) => vehicleController.update(req, res))
}