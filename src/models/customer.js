const Sequelize = require('sequelize')
const database = require('../../config/database/database')

const Model = Sequelize.Model
const sequelize = database.connect()

class Customer extends Model {}
Customer.init({
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING },
  cpfcnpj: { type: Sequelize.STRING },
  cpfcnpjtatus: { type: Sequelize.STRING },
  birthdate: { type: Sequelize.DATE },
  gender: { type: Sequelize.STRING },
  mother_name: { type: Sequelize.STRING },
  deceased: { type: Sequelize.BOOLEAN },
  occupation: { type: Sequelize.STRING },
  income: { type: Sequelize.STRING },
  credit_risk: { type: Sequelize.STRING },
  company_token: { type: Sequelize.STRING, allowNull: false },
  created_at: { type: Sequelize.DATE },
  updated_at: { type: Sequelize.DATE }
}, {
  sequelize,
  modelName: 'customer'
})

module.exports = Customer