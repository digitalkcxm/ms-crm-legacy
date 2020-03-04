const database = require('../config/database/database')

class Email {
  async create (customerId, email) {
    try {
      const customerEmail = await this.getByEmail(customerId, email)
      if (!customerEmail) {
        const emailId = await database('email')
          .insert({ email, id_customer: customerId }, 'id')
        return emailId[0]
      }
      return customerEmail.id
    } catch (err) {
      return err
    }
  }

  async update (customerId, emailId, email) {
    try {
      const result = await database('email')
        .update({ email }, ['id', 'email', 'created_at', 'updated_at'])
        .where({ id: emailId, id_customer: customerId })
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

  async getAllByCustomer(customerId) {
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
}

module.exports = Email