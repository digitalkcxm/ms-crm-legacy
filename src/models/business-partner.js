const database = require('../config/database/database')
const moment = require('moment')

class BusinessPartner {
  async createOrUpdate (customerId, newBusinessPartner) {
    try {
      const businessPartner = await this.getByCnpj(customerId, newBusinessPartner.cnpj)
      if (businessPartner) {
        return await this.update(customerId, businessPartner.id, newBusinessPartner)
      } else {
        return await this.create(customerId, newBusinessPartner)
      }
    } catch (err) {
      return err
    }
  }

  async update (customerId, businessPartnerId, data) {
    try {
      const result = await database('business_partner')
        .update(data, ['id', 'fantasy_name', 'cnpj', 'status', 'foundation_date', 'created_at', 'updated_at'])
        .where({ id_customer: customerId, id: businessPartnerId })

      result[0].foundation_date = moment(result[0].foundation_date).format('DD/MM/YYYY')

      return result[0]
    } catch (err) {
      return err
    }
  }

  async create (customerId, data) {
    try {
      data.id_customer = customerId
      const businessPartnerId = await database('business_partner')
        .insert(data, 'id')
      return businessPartnerId[0]
    } catch (err) {
      return err
    }
  }

  async getByCnpj (customerId, cnpj) {
    try {
      const businessPartner = await database('business_partner')
        .select(['id'])
        .where({ id_customer: customerId, cnpj })
      if (businessPartner && businessPartner.length > 0) return businessPartner[0]
      return null
    } catch (err) {
      return err
    }
  }

  async getAllByCustomer (customerId) {
    try {
      const businessPartnerList = await database('business_partner')
        .select(['id', 'fantasy_name', 'cnpj', 'status', 'foundation_date', 'created_at', 'updated_at'])
        .where({ id_customer: customerId })

      return businessPartnerList
    } catch (err) {
      return err
    }
  }
}

module.exports = BusinessPartner