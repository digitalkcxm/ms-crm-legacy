module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('phones', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      number: { type: Sequelize.STRING },
      type: { type: Sequelize.STRING },
      customer_id: { type: Sequelize.INTEGER, allowNull: false }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('phones')
  }
}