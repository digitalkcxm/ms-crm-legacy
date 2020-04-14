const database = require('../config/database/database')

class Phone {
  async createOrUpdate (customerId, newPhone) {
    try {
      const phone = await this.getByNumber(customerId, newPhone.number)
      if (phone) {
        return await this.update(customerId, phone.id, newPhone)
      } else {
        return await this.create(customerId, newPhone)
      }
    } catch (err) {
      return err
    }
  }

  async create (customerId, phone) {
    try {
      phone.id_customer = customerId
      const phoneId = await database('phone')
        .insert(phone, 'id')
      return phoneId[0]
    } catch (err) {
      return err
    }
  }

  async update (customerId, phoneId, phone) {
    try {
      const result = await database('phone')
        .update({ type: phone.type, number: phone.number }, ['id', 'number', 'type', 'created_at', 'updated_at'])
        .where({ id_customer: customerId, id: phoneId })
      return result[0]
    } catch (err) {
      return err
    }
  }

  async getByNumber (customerId, number) {
    try {
      const phone = await database('phone')
        .select(['id'])
        .where({ id_customer: customerId, number })
      if (phone && phone.length > 0) return phone[0]
      return null
    } catch (err) {
      return err
    }
  }

  async getAllByCustomer (customerId) {
    try {
      const phones = await database('phone')
        .select(['id', 'number', 'type', 'created_at', 'updated_at'])
        .where({ id_customer: customerId })
      return phones
    } catch (err) {
      return err
    }
  }

  async listAllByCustomers (customerIdList) {
    try {
      const phones = await database('phone')
        .select(['id', 'number', 'type', 'id_customer'])
        .whereIn('id_customer', customerIdList)
      return phones
    } catch (err) {
      return err
    }
  }
}

module.exports = Phone