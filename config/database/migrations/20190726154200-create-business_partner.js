module.exports = {
  up: (queryInteface, Sequelize) => {
    return queryInteface.createTable('business_partners', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fantasy_name: { type: Sequelize.STRING },
      cnpj: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      foundation_date: { type: Sequelize.DATE },
      customer_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE }
    })
  },
  down: (queryInteface, Sequelize) => {
    return queryInteface.dropTable('business_partners')
  }
}