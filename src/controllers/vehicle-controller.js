const Customer = require('../models/customer')
const Vehicle = require('../models/vehicle')

const customerModel = new Customer()
const vehicleModel = new Vehicle()

class VehicleController {
  async create (req, res) {
    req.assert('plate', 'A placa é obrigatória').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['token']

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer && !customer.length > 0) return res.status(500).send({ err: "Customer não encontrado." })

      const dataVehicle = {
        plate: req.body.plate,
        model: (req.body.model) ? req.body.model : null,
        year: (req.body.year) ? req.body.year : null,
        renavam: (req.body.renavam) ? req.body.renavam : null,
        chassi: (req.body.chassi) ? req.body.chassi : null,
        license: (req.body.license) ? req.body.license : null
      }

      await vehicleModel.createOrUpdate(customerId, dataVehicle)

      return res.sendStatus(201)
    } catch (err) {
      console.error(err)
      return res.status(500).send({ err: err.message })
    }
  }

  async update (req, res) {
    req.assert('plate', 'A placa é obrigatória').notEmpty()

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    const companyToken = req.headers['token']

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    let vehicleId = req.params.vehicleId
    if (!vehicleId) return res.status(400).send({ error: "O ID do vehicle é obrigatório." })
    else vehicleId = parseInt(vehicleId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer && !customer.length > 0) return res.status(500).send({ err: "Customer não encontrado." })

      const dataVehicle = req.body

      await vehicleModel.update(customerId, vehicleId, dataVehicle)
      
      const vehicle = await vehicleModel.getById(vehicleId, customerId)

      return res.status(200).send(vehicle)
    } catch (err) {
      console.error(err)
      return res.status(500).send({ err: err.message })
    }
  }

  async getAll (req, res) {
    const companyToken = req.headers['token']

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer && !customer.length > 0) return res.status(500).send({ err: "Customer não encontrado." })

      const vehicles = await vehicleModel.getAllByCustomer(req.params.customerId)
      return res.status(200).send(vehicles)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = VehicleController