const database = require('../config/database/database')

const maxQueryParams = 32767
class Email {
  async create (customerId, email) {
    try {
      await database('email')
        .insert({ email, id_customer: customerId })
    } catch (err) {
      return err
    }
  }

  async update (customerId, emailId, email) {
    try {
      const result = await database('email')
        .update({ email }, ['id', 'email', 'created_at', 'updated_at'])
        .where('id', emailId)
        .where('id_customer', customerId)

      return result[0]
    } catch (err) {
      return err
    }
  }

  async getByEmail(customerId, email) {
    try {
      const customerEmail = await database('email')
        .select(['id', 'email'])
        .where({ id_customer: customerId, email })
      if (!customerEmail) return null
      return customerEmail[0]
    } catch (err) {
      return err
    }
  }

  async getAllByCustomer(customerId = 0) {
    try {
      const emails = await database('email')
        .select(['id', 'email', 'created_at', 'updated_at'])
        .where({ id_customer: customerId })
      return emails
    } catch (err) {
      return err
    }
  }

  async listAllByCustomers (customerIdList) {
    try {
      const emails = await database('email')
        .select(['id', 'email', 'id_customer'])
        .whereIn('id_customer', customerIdList)
      return emails
    } catch (err) {
      return err
    }
  }

  async persistBatch (emailList = []) {
    if (emailList.length <= 0) return []

    const maxEmailByInsert = Math.floor(maxQueryParams / 3)

    try {
      const lastIndexEmailList = emailList.length - 1
      let chunkEmailList = []
      let numEmail = 0

      for (let indexEmail in emailList) {
        const email = emailList[indexEmail]
        chunkEmailList.push(email)

        if (numEmail === maxEmailByInsert || indexEmail == lastIndexEmailList) {
          await database('email').insert(chunkEmailList)
          
          chunkEmailList = []
          numEmail = 0
        }

        numEmail += 1
      }

      
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = Email