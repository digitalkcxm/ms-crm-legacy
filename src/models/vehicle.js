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
      const result = await database('vehicle')
        .update(vehicle, ['id', 'plate', 'model', 'year', 'renavam', 'chassi', 'license', 'created_at', 'updated_at'])
        .where({ id_customer: customerId, id: vehicleId })
      return result[0]
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

  async getAllByCustomer (customerId) {
    try {
      const vehicles = await database('vehicle')
        .select(['id', 'plate', 'model', 'year', 'renavam', 'chassi', 'license', 'created_at', 'updated_at'])
        .where({ id_customer: customerId })
      return vehicles
    } catch (err) {
      return err
    }
  }
}

module.exports = Vehicle