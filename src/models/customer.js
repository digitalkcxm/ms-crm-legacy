const database = require('../config/database/database')

class Customer {
  async createOrUpdate(companyToken, cpfcnpj, data) {
    try {
      const customer = await this.getByCpfCnpj(cpfcnpj, companyToken)
      if (customer) {
        return await this.update(customer.id, data)
      } else {
        data.company_token = companyToken
        return await this.create(data)
      }
    } catch (err) {
      return err
    }
  }

  async create (data) {
    try {
      const customerId = await database('customer')
        .insert(data, 'id')
      return customerId[0]
    } catch (err) {
      return err
    }
  }

  async getById (id, company_token) {
    try {
      const customer = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'created_at', 'updated_at'])
        .where({ id, company_token })
      if (customer) return customer[0]
      return null
    } catch (err) {
      return err
    }
  }

  async update(customerId, data) {
    try {
      await database('customer')
        .update(data, 'id')
        .where({ id: customerId })
      return customerId
    } catch (err) {
      return err
    }
  }

  async getByCpfCnpj (cpfcnpj, company_token) {
    try {
      const customer = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'created_at', 'updated_at'])
        .where({ cpfcnpj, company_token })
      if (customer) return customer[0]
      return null
    } catch (err) {
      return err
    }
  }
}

module.exports = Customer