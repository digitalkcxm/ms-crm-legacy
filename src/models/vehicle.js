const database = require('../config/database/database')

class Vehicle {
  async createOrUpdate (customerId, newVehicle) {
    try {
      const vehicle = await this.getByPlate(customerId, newVehicle.plate)
      if (vehicle) {
        return await this.update(customerId, vehicle.id, newVehicle)
      } else {
        return await this.create(customerId, newVehicle)
      }
    } catch (err) {
      return err
    }
  }

  async create (customerId, newVehicle) {
    try {
      newVehicle.id_customer = customerId
      const vehicleId = await database('vehicle')
        .insert(newVehicle, 'id')
      return vehicleId[0]
    } catch (err) {
      return err
    }
  }

  async update (customerId, vehicleId, vehicle) {
    try {
      await database('vehicle')
        .update(vehicle, 'id')
        .where({ id_customer: customerId, id: vehicleId })
      return vehicleId
    } catch (err) {
      return err
    }
  }

  async getByPlate (customerId, plate) {
    try {
      const vehicle = await database('vehicle')
        .select(['id'])
        .where({ id_customer: customerId, plate })
      if (vehicle && vehicle.length > 0) return vehicle[0]
      return null
    } catch (err) {
      return err
    }
  }
}

module.exports = Vehicle