module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('addresses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      street: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      cep: { type: Sequelize.STRING },
      state: { type: Sequelize.STRING },
      district: { type: Sequelize.STRING },
      type: { type: Sequelize.STRING },
      customer_id: { type: Sequelize.INTEGER, allowNull: false }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('addresses')
  }
}