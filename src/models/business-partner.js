const database = require('../config/database/database')
const moment = require('moment')

const maxQueryParams = 32767
class BusinessPartner {
  async createOrUpdate (customerId, newBusinessPartner) {
    try {
      const businessPartner = await this.getByCnpj(customerId, newBusinessPartner.cnpj)
      if (businessPartner) {
        this.update(customerId, businessPartner.id, newBusinessPartner)
      } else {
        this.create(customerId, newBusinessPartner)
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
      businessPartnerId = await database('business_partner')
        .insert(data)
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

  async getById (bpId = 0, customerId = 0) {
    try {
      const businessPartner = await database('business_partner')
        .select(['id', 'fantasy_name', 'cnpj', 'status', 'foundation_date', 'created_at', 'updated_at'])
        .where({ id: bpId, id_customer: customerId })
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

  async persistBatch (businessPartnerList = []) {
    if (businessPartnerList.length <= 0) return []
    
    const maxBusinessPartnerByInsert = Math.floor(maxQueryParams / 10)

    try {
      const lastIndexBusinessPartnerList = businessPartnerList.length - 1
      let chunkBusinessPartnerList = []
      let numBusinessPartner = 0

      for (let indexBusinessPartner in businessPartnerList) {
        const bp = businessPartnerList[indexBusinessPartner]
        chunkBusinessPartnerList.push(bp)

        if (numBusinessPartner === maxBusinessPartnerByInsert || indexBusinessPartner == lastIndexBusinessPartnerList) {
          await database('business_partner').insert(chunkBusinessPartnerList)
          
          chunkBusinessPartnerList = []
          numBusinessPartner = 0
        }

        numBusinessPartner += 1
      }
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = BusinessPartner