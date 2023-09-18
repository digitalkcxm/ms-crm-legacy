const database = require('../config/database/database')

const maxQueryParams = 32767
class Email {
  async create(customerId, email) {
    try {
      await database('email').insert({ email, id_customer: customerId })
    } catch (err) {
      return err
    }
  }

  async update(customerId, emailId, email) {
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
      const customerEmail = await database('email').select(['id', 'email']).where({ id_customer: customerId, email })
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
        .orderBy('updated_at', 'desc')
      return emails.filter((e) => e.email)
    } catch (err) {
      return err
    }
  }

  async listAllByCustomers(customerIdList) {
    const emails = []

    if (customerIdList.length === 0) return emails

    const maxSizeCustomerId = Math.floor(maxQueryParams / 2)

    try {
      const lastIndexCustomerId = customerIdList.length - 1
      let chunkCustomerIdList = []
      let numCustomerId = 0

      for (let iCustomerId in customerIdList) {
        const customerId = customerIdList[iCustomerId]
        chunkCustomerIdList.push(customerId)

        if (numCustomerId === maxSizeCustomerId || iCustomerId == lastIndexCustomerId) {
          let result = await database('email')
            .select(['id', 'email', 'id_customer', 'created_at', 'updated_at'])
            .whereIn('id_customer', chunkCustomerIdList)
            .orderBy('updated_at', 'desc')

          result = result.filter((e) => e.email)
          emails.push(...result)
          chunkCustomerIdList = []
          numCustomerId = 0
        }

        numCustomerId += 1
      }
      return emails
    } catch (err) {
      return err
    }
  }

  async persistBatch(emailList = []) {
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

  async deleteByCustomerIdList(customerIdList = []) {
    try {
      await database('email').whereIn('id_customer', customerIdList).del()
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async deleteCPCByCustomerIdList(customerIdList = []) {
    try {
      await database('cpc_email').whereIn('id_customer', customerIdList).del()
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async insertCPC(customerId = 0, emailId = 0, cpc = false, userId = 0, username = '', updated_at = moment().format()) {
    try {
      return await database('cpc_email')
        .insert({
          cpc,
          id_customer: customerId,
          id_email: emailId,
          user_id: userId,
          username,
          updated_at,
          created_at: updated_at
        })
        .returning(['id'])
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async getLastCPC(customerId = 0, email = '') {
    try {
      const result = await database('cpc_email')
        .select(['cpc_email.*'])
        .leftJoin('email', 'email.id', 'cpc_email.id_email')
        .where('cpc_email.id_customer', customerId)
        .where('email.email', email)
        .orderBy('cpc_email.id', 'desc')
        .limit(1)
      if (result.length) {
        return result[0]
      }

      return null
    } catch (err) {
      console.error(err)
      return { error: 'ocorreu erro na consulta' }
    }
  }
}

module.exports = Email
