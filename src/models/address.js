const database = require('../config/database/database')

class Address {
  async createOrUpdate (customerId, newAddress) {
    try {
      const address = await this.getByStreetAndCep(customerId, newAddress.street, newAddress.cep)
      if (address) {
        return await this.update(customerId, address.id, newAddress)
      } else {
        return await this.create(customerId, newAddress)
      }
    } catch (err) {
      return err
    }
  }

  async create (customerId, newAddress) {
    try {
      newAddress.id_customer = customerId
      const addressId = await database('address')
        .insert(newAddress, 'id')
      return addressId[0]
    } catch (err) {
      return err
    }
  }

  async update (customerId, addressId, address) {
    try {
      const result = await database('address')
        .update(address, ['id', 'street', 'city', 'cep', 'state', 'district', 'type', 'created_at', 'updated_at'])
        .where({ id_customer: customerId, id: addressId })
        
      return result[0]
    } catch (err) {
      return err
    }
  }

  async getByStreetAndCep (customerId, street, cep) {
    try {
      const address = await database('address')
        .select(['id'])
        .where({ id_customer: customerId, street, cep })
      if (address && address.length > 0) return address[0]
      return null
    } catch (err) {
      return err
    }
  }

  async getAllByCustomer (customerId) {
    try {
      const addressList = await database('address')
        .select(['id', 'street', 'city', 'cep', 'state', 'district', 'type'])
        .where({ id_customer: customerId })
      
      return addressList
    } catch (err) {
      return err
    }
  }
}

module.exports = Address