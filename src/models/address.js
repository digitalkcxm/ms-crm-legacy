const database = require('../config/database/database')

const maxQueryParams = 32767
class Address {
  async createOrUpdate (customerId, newAddress) {
    try {
      const address = await this.getByStreetAndCep(customerId, newAddress.street, newAddress.cep)
      if (address) {
        await this.update(customerId, address.id, newAddress)
      } else {
        await this.create(customerId, newAddress)
      }
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async create (customerId, newAddress) {
    try {
      newAddress.id_customer = customerId
      await database('address')
        .insert(newAddress)
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

  async getById (addressId = 0, customerId = 0) {
    try {
      const address = await database('address')
        .select(['id', 'street', 'city', 'cep', 'state', 'district', 'type'])
        .where({ id: addressId, id_customer: customerId })
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

  async persistBatch (addressList = []) {
    if (addressList.length <= 0) return []

    const maxAddressByInsert = Math.floor(maxQueryParams / 10)

    try {
      const lastIndexAddressList = addressList.length - 1
      let chunkAddressList = []
      let numAddress = 0
      for (let indexAddress in addressList) {
        const address = addressList[indexAddress]
        chunkAddressList.push(address)

        if (numAddress === maxAddressByInsert || indexAddress == lastIndexAddressList) {
          await database('address').insert(chunkAddressList)

          chunkAddressList = []
          numAddress = 0
        }

        numAddress += 1
      }
      
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = Address