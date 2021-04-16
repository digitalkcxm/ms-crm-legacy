const database = require('../config/database/database')

const maxQueryParams = 32767
class Phone {
  async createOrUpdate (customerId, newPhone) {
    try {
      const phone = await this.getByNumber(customerId, newPhone.number)
      
      if (phone) {
        await this.update(customerId, phone.id, newPhone)
      } else {
        await this.create(customerId, newPhone)
      }
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async create (customerId, phone) {
    try {
      phone.id_customer = parseInt(customerId)
      await database('phone')
        .insert(phone)
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async update (customerId, phoneId, phone) {
    try {
      await database('phone')
        .update({ type: phone.type, number: phone.number })
        .where({ id_customer: customerId, id: phoneId })
    } catch (err) {
      return err
    }
  }

  async getById (phoneId = 0, customerId = '') {
    try {
      const phone = await database('phone')
        .select(['id', 'number', 'type', 'created_at', 'updated_at'])
        .where({ id: phoneId, id_customer: customerId })
      if (phone && phone.length > 0) return phone[0]
      return null
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
        .orderBy('updated_at', 'desc')
      return phones
    } catch (err) {
      return err
    }
  }

  async listAllByCustomers (customerIdList) {
    let phones = []
    if (customerIdList.length === 0) return phones

    const maxSizeCustomerId = Math.floor(maxQueryParams / 2)

    try {
      const lastIndexCustomerId = customerIdList.length - 1
      let chunkCustomerIdList = []
      let numCustomerId = 0

      for (let iCustomerId in customerIdList) {
        const customerId = customerIdList[iCustomerId]
        chunkCustomerIdList.push(customerId)

        if (numCustomerId === maxSizeCustomerId || iCustomerId == lastIndexCustomerId) {
          const result = await database('phone')
                          .select(['id', 'number', 'type', 'id_customer', 'created_at', 'updated_at'])
                          .whereIn('id_customer', chunkCustomerIdList)
                          .orderBy('updated_at', 'desc')

          phones.push(...result)
          chunkCustomerIdList = []
          numCustomerId = 0
        }

        numCustomerId += 1
      }

      return phones
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async persistBatch (phoneList = []) {
    if (phoneList.length <= 0) return []

    const maxPhoneByInsert = Math.floor(maxQueryParams / 4)

    try {
      const lastIndexPhoneList = phoneList.length - 1
      let chunkPhoneList = []
      let numPhone = 0

      for (let indexPhone in phoneList) {
        const phone = phoneList[indexPhone]
        chunkPhoneList.push(phone)

        if (numPhone === maxPhoneByInsert || indexPhone == lastIndexPhoneList) {
          await database('phone').insert(chunkPhoneList)

          chunkPhoneList = []
          numPhone = 0
        }
        numPhone += 1
      }
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = Phone